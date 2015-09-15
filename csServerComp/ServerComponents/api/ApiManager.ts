import Winston = require('winston');
import helpers = require('../helpers/Utils');
import fs = require('fs');
import path = require('path');
import events = require("events");
import _ = require('lodash');
import async = require('async');

/**
 * Api Result status
 */
export enum ApiResult {
    OK = 200,
    Error = 400,
    LayerAlreadyExists = 406,
    LayerNotFound = 407,
    FeatureNotFound = 408,
    ProjectAlreadyExists = 409,
    ProjectNotFound = 410,
    ResourceNotFound = 428
}

export interface ApiMeta {
    source?: string;
    user?: string;
}

/**
 * Default result object for api calls
 */
export class CallbackResult {
    public result: ApiResult;
    public error: any;
    public project: Project;
    public layer: Layer;
    public feature: Feature;
    public keys: { [keyId: string]: Key };
}

export interface IConnector {
    id: string;
    isInterface: boolean;
    /** If true (default), the manager will send a copy to the source (receiving) connector */
    receiveCopy: boolean;
    init(layerManager: ApiManager, options: any);
    initLayer(layer: Layer, meta?: ApiMeta);
    initProject(project: Project, meta?: ApiMeta);

    //Layer methods
    addLayer(layer: Layer, meta: ApiMeta, callback: Function);
    getLayer(layerId: string, meta: ApiMeta, callback: Function);
    updateLayer(layer: Layer, meta: ApiMeta, callback: Function);
    deleteLayer(layerId: string, meta: ApiMeta, callback: Function);
    //feature methods
    addFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function);
    getFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function);
    updateFeature(layerId: string, feature: any, useLog: boolean, meta: ApiMeta, callback: Function);
    deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function);
    //log methods
    addLog(layerId: string, featureId: string, property: string, log: Log, meta: ApiMeta, callback: Function);
    getLog(layerId: string, featureId: string, meta: ApiMeta, callback: Function);
    deleteLog(layerId: string, featureId: string, ts: number, prop: string, meta: ApiMeta, callback: Function);
    updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function);
    updateLogs(layerId: string, featureId: string, logs: { [key: string]: Log[] }, meta: ApiMeta, callback: Function);
    //geospatial stuff
    getBBox(layerId: string, southWest: number[], northEast: number[], meta: ApiMeta, callback: Function);
    getSphere(layerId: string, maxDistance: number, longtitude: number, latitude: number, meta: ApiMeta, callback: Function);
    getWithinPolygon(layerId: string, feature: Feature, meta: ApiMeta, callback: Function);
    //add a new project (e.g., for Excel2map)
    addProject(project: Project, meta: ApiMeta, callback: Function);
    deleteProject(projectId: string, meta: ApiMeta, callback: Function);

    /** Get a specific key */
    getKey(keyId: string, meta: ApiMeta, callback: Function);
    /** Get a list of available keys */
    getKeys(meta: ApiMeta, callback: Function);
    /** Update the value for a given keyId */
    updateKey(keyId: string, value: Object, meta: ApiMeta, callback: Function);
    /** Delete key */
    deleteKey(keyId: string, meta: ApiMeta, callback: Function);
    /** listen to key updates */
    subscribeKey(keyPattern: string, meta: ApiMeta, callback: Function);
}


export interface StorageObject {
    id: string;
    storage: string;
}

export class Key implements StorageObject {
    id: string;
    title: string;
    storage: string;
}

export class Project implements StorageObject {
    id: string;
    title: string;
    url: string;
    description: string;
    logo: string;
    connected: boolean;
    storage: string;
}

/**
 * Geojson Layer definition
 */
export class Layer implements StorageObject {
    /**
     * id of storage connector
     */
    public storage: string;
    public useLog: boolean;
    public updated: number;
    public id: string;
    public type: string;
    public dynamic: boolean;
    public title: string;
    public image: string;
    public description: string;
    public url: string;
    public typeUrl: string;
    public defaultFeatureType: string;
    public tags: string[];
    public features: Feature[] = [];
}

/**
 * Geojson ProjectId definition
 */
export class ProjectId {
    public id: string;
}

/**
 * Geojson geometry definition
 */
export class Geometry {
    public type: string;
    public coordinates: number[];
}

/**
 * Geojson feature definition
 */
export class Feature {
    public id: string;
    public geometry: Geometry;
    public properties: { [key: string]: any };
    public logs: { [key: string]: Log[] };
}

/**
 * Geojson property definition
 */
export class Property {

}

export class Log {
    public ts: number;
    public prop: string;
    public value: any;
}

export class FeatureType {

}

export class PropertyType {

}

export class ResourceFile {
    featureTypes: { [key: string]: FeatureType };
    propertyTypes: { [key: string]: PropertyType };
}

export class ApiManager extends events.EventEmitter {

    /**
     * Dictionary of connectors (e.g. storage, interface, etc.)
     */
    public connectors: { [key: string]: IConnector } = {}

    /**
     * Dictionary of resources
     */
    public resources: { [key: string]: ResourceFile } = {};

    /**
     * Dictionary of layers (doesn't contain actual data)
     */
    public layers: { [key: string]: Layer } = {};

    /**
     * Dictionary of projects (doesn't contain actual data)
     */
    public projects: { [key: string]: Project } = {};

    /**
     * Dictionary of sensor sets
     */
    public keys: { [keyId: string]: Key } = {};

    public defaultStorage = "";
    public defaultLogging = false;
    public rootPath = "";
    public resourceFolder = "/data/resourceTypes";
    public projectsFile = "";
    public layersFile = "";
    /** The ApiManager name can be used to identify this instance (e.g. mqtt can create a namespace/channel for this api) */
    public name: string = "cs";

    /** Create a new client, optionally specifying whether it should act as client. */
    constructor(public isClient = false) {
        super();
    }

    public init(rootPath: string, callback: Function) {
        Winston.info(`Init layer manager (isClient=${this.isClient})`, { cat: "api" });
        this.rootPath = rootPath;
        this.initResources(path.join(this.rootPath, '/resourceTypes/'));
        this.loadLayerConfig(() => {
            callback();
        });
    }

    /**
     * Open layer config file
     */
    public loadLayerConfig(cb: Function) {
        Winston.info('manager: loading layer config');
        this.layersFile = path.join(this.rootPath, 'layers.json');

        fs.readFile(this.layersFile, "utf-8", (err, data) => {
            if (!err) {
                Winston.info('manager: layer config loaded');
                this.layers = <{ [key: string]: Layer }>JSON.parse(data);
            }
            cb();
        });

    }

    /**
     * Have a 1 sec. delay before saving project config
     */
    public saveProjectDelay = _.debounce((project: Project) => {
        this.saveProjectConfig();
    }, 1000);

    /**
     * Have a 1 sec. delay before saving layer config
     */
    public saveLayersDelay = _.debounce((layer: Layer) => {
        this.saveLayerConfig();
    }, 1000);

    /**
     * Store layer config file
     */
    public saveProjectConfig() {
        fs.writeFile(this.projectsFile, JSON.stringify(this.projects), (error) => {
            if (error) {
                Winston.info('manager: error saving project config');
            }
            else {
                Winston.info('manager: project config saved');
            }
        });
    }

    /**
     * Store layer config file
     */
    public saveLayerConfig() {
        fs.writeFile(this.layersFile, JSON.stringify(this.layers), (error) => {
            if (error) {
                Winston.info('manager: error saving layer config');
            }
            else {
                Winston.info('manager: layer config saved');
            }
        });
    }

    /**
     * Look for available resources (from folder)
     */
    public initResources(resourcesPath: string) {
        //TODO implement
        if (!fs.existsSync(resourcesPath)) {
            fs.mkdirSync(resourcesPath);
        }
        fs.readdir(resourcesPath, (e, f) => {
            f.forEach((file) => {
                var loc = path.join(resourcesPath, file);
                fs.readFile(loc, "utf-8", (err, data) => {
                    if (!err) {
                        console.log('Opening ' + loc);
                        this.resources[file.replace('.json', '').toLowerCase()] = <ResourceFile>JSON.parse(data);
                    } else {
                        console.log('Error opening ' + loc + ': ' + err);
                    };
                });

            });
        });
    }

    /**
     * Update/add a resource and save it to file
     */
    public updateResource(id: string, resource: ResourceFile) {
        //TODO implement
    }

    /**
     * Update/add a resource and save it to file
     */
    public getResource(id: string): ResourceFile {
        if (this.resources.hasOwnProperty(id)) {
            return this.resources[id];
        }
        return null;
        //TODO implement
    }

    /**
     * Update/add a resource and save it to file
     */
    public getNewProject(title: string): ProjectId {
        var id = helpers.newGuid();
        var newProject: ProjectId = { id: id };

        var project = new Project();
        project.id = id;
        project.title = title;
        project.logo = "";
        project.connected = true;
        project.storage = "file";

        var meta = <ApiMeta>{ source: 'rest' };
        this.addProject(project, meta, () => { });

        return newProject;
    }

    public addProject(project: Project, meta: ApiMeta, callback: Function) {
        Winston.info('api: add project ' + project.id);
        var s = this.findStorage(project);
        // check if layer already exists
        if (!this.projects.hasOwnProperty(project.id)) {
            this.projects[project.id] = <Project>{
                id: project.id,
                storage: s.id,
                title: project.title,
                connected: project.connected,
                logo: project.logo,
                url: '/api/dynamicprojects/' + project.id
            };

            // store project
            var meta = <ApiMeta>{ source: 'rest' };
            s.addProject(project, meta, (r: CallbackResult) => {
                callback(r);
            });

            this.getInterfaces(meta).forEach((i: IConnector) => {
                i.initProject(project);
                i.addProject(project, meta, () => { });
            });
        } else {
            callback(<CallbackResult>{ result: ApiResult.ProjectAlreadyExists, error: "Project already exists" });
        }

        this.saveProjectDelay(project);
    }

    /**
     * Add connector to available connectors
     */
    public addConnector(key: string, s: IConnector, options: any) {
        // TODO If client, check that only one interface is added (isInterface = true)
        s.id = key;
        this.connectors[key] = s;
        s.init(this, options);
    }

    /**
     * Find layer for a specific layerId (can return null)
     */
    public findLayer(layerId: string): Layer {
        if (this.layers.hasOwnProperty(layerId)) {
            return this.layers[layerId];
        }
        return null;
    }

    /**
     * Find project for a specific projectId (can return null)
     */
    public findProject(projectId: string): Project {
        if (this.projects.hasOwnProperty(projectId)) {
            return this.projects[projectId];
        }
        return null;
    }

    /**
     * Find layer for a specific layerId (can return null)
     */
    public findKey(keyId: string): Key {
        return this.keys.hasOwnProperty(keyId)
            ? this.keys[keyId]
            : null;
    }

    /**
     * find feature in a layer by featureid
     */
    public findFeature(layerId: string, featureId: string, callback: Function) {
        var layer = this.findLayer(layerId);
        var s = this.findStorage(layer);
        s.getFeature(layerId, featureId, {}, (r) => callback(r));
    }

    /**
     * Find storage for a layer
     */
    public findStorage(object: StorageObject): IConnector {
        var storage = (object && object.storage) || this.defaultStorage;
        if (this.connectors.hasOwnProperty(storage)) return this.connectors[storage];
        return null;
    }

    /**
     * Lookup layer and return storage engine for this layer
     */
    public findStorageForLayerId(layerId: string): IConnector {
        var layer = this.findLayer(layerId);
        return this.findStorage(layer);
    }

    /**
     * Lookup Porject and return storage engine for this project
     */
    public findStorageForProjectId(projectId: string): IConnector {
        var project = this.findProject(projectId);
        return this.findStorage(project);
    }

    /**
     * Lookup layer and return storage engine for this layer
     */
    public findStorageForKeyId(keyId: string): IConnector {
        var key = this.findKey(keyId);
        return this.findStorage(key);
    }

    /**
     * Returns layer definition for a layer, this is the layer without the features (mostly used for directory)
     */
    private getLayerDefinition(layer: Layer): Layer {
        if (!layer.hasOwnProperty('type')) layer.type = "geojson";
        var r = <Layer>{
            id: layer.id,
            title: layer.title,
            updated: layer.updated,
            description: layer.description,
            type: layer.type,
            storage: layer.storage ? layer.storage : "",
            url: layer.url ? layer.url : ("/api/layers/" + layer.id)
        };
        return r;
    }

    //layer methods start here, in CRUD order.
    public addLayer(layer: Layer, meta: ApiMeta, callback: Function) {
        // give it an id if not available
        if (!layer.hasOwnProperty('id')) layer.id = helpers.newGuid();
        // make sure layerid is lowercase
        layer.id = layer.id.toLowerCase();
        // take the id for the title if not available
        if (!layer.hasOwnProperty('title')) layer.title = layer.id;
        if (!layer.hasOwnProperty('features')) layer.features = [];
        if (!layer.hasOwnProperty('tags')) layer.tags = [];
        this.setUpdateLayer(layer, meta);
        Winston.info('api: add layer ' + layer.id);
        var s = this.findStorage(layer);
        // check if layer already exists
        if (!this.layers.hasOwnProperty(layer.id)) {
            // add storage connector if available
            layer.storage = s ? s.id : "";

            // get layer definition (without features)
            this.layers[layer.id] = this.getLayerDefinition(layer);

            this.getInterfaces(meta).forEach((i: IConnector) => {
                i.initLayer(layer);
                i.addLayer(layer, meta, () => { });
            });

            // store layer
            if (s) s.addLayer(layer, meta, (r: CallbackResult) => {
                callback(r);
            })
            else {
                callback(<CallbackResult>{ result: ApiResult.OK });
            };

            this.saveLayersDelay(layer);
        }
        else {
            callback(<CallbackResult>{ result: ApiResult.LayerAlreadyExists, error: "Layer already exists" });
        }
    }


    public getLayer(layerId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        if (s) s.getLayer(layerId, meta, (r: CallbackResult) => {
            callback(r);
        })
        else { callback(<CallbackResult>{ result: ApiResult.LayerNotFound }); }
    }

    public updateLayer(layer: Layer, meta: ApiMeta, callback: Function) {
        async.series([
            // make sure layer exists
            (cb: Function) => {
                if (!this.layers.hasOwnProperty(layer.id)) {
                    this.addLayer(layer, meta, () => {
                        cb();
                    });
                }
                else { cb(); }
            },
            // update layer
            (cb: Function) => {
                this.setUpdateLayer(layer, meta);
                var l = this.getLayerDefinition(layer);
                this.layers[l.id] = l;

                this.getInterfaces(meta).forEach((i: IConnector) => {
                    i.updateLayer(layer, meta, () => { });
                });

                var s = this.findStorageForLayerId(layer.id);
                if (s) {
                    s.updateLayer(layer, meta, (r, CallbackResult) => {
                        Winston.warn('updating layer finished');
                    });
                }
                callback(<CallbackResult>{ result: ApiResult.OK });
                this.saveLayersDelay(layer);
            }
        ])


    }

    public deleteLayer(layerId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.deleteLayer(layerId, meta, (r: CallbackResult) => {
            delete this.layers[layerId];
            this.getInterfaces(meta).forEach((i: IConnector) => {
                i.deleteLayer(layerId, meta, () => { });
            });
            callback(r);
        });
    }

    public deleteProject(projectId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForProjectId(projectId);
        s.deleteProject(projectId, meta, (r: CallbackResult) => {
            delete this.projects[projectId];
            this.getInterfaces(meta).forEach((i: IConnector) => {
                i.deleteProject(projectId, meta, () => { });
            });
            callback(r);
        });
    }

    public getInterfaces(meta: ApiMeta): IConnector[] {
        var res = [];
        for (var i in this.connectors) {
            if (this.connectors[i].isInterface && (this.connectors[i].receiveCopy || meta.source !== i)) res.push(this.connectors[i]);
        }
        return res;
    }

    private setUpdateLayer(layer: Layer, meta: ApiMeta) {
        layer.updated = new Date().getTime();
    }

    // Feature methods start here, in CRUD order.

    public addFeature(layerId: string, feature: Feature, meta: ApiMeta, callback: Function) {
        Winston.info('feature added');
        var layer = this.findLayer(layerId);
        if (!layer) {
            callback(<CallbackResult>{ result: ApiResult.Error, error: 'layer not found' });
        }
        else {
            this.setUpdateLayer(layer, meta);
            var s = this.findStorage(layer);
            s.addFeature(layerId, feature, meta, (result) => callback(result));
            this.getInterfaces(meta).forEach((i: IConnector) => {
                i.addFeature(layerId, feature, meta, () => { });
            });
        }
    }

    public updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function) {
        var layer = this.findLayer(layerId);
        this.setUpdateLayer(layer, meta);
        var s = this.findStorage(layer);
        this.updateProperty(layerId, featureId, property, value, useLog, meta, (r) => callback(r));
    }

    public updateLogs(layerId: string, featureId: string, logs: { [key: string]: Log[] }, meta: ApiMeta, callback: Function) {
        var layer = this.findLayer(layerId);
        this.setUpdateLayer(layer, meta);
        var s = this.findStorage(layer);
        // check if timestamps are set (if not, do it)
        for (var p in logs) {
            logs[p].forEach((l: Log) => {
                if (!l.ts) l.ts = new Date().getTime();
            });
        }
        s.updateLogs(layerId, featureId, logs, meta, (r) => callback(r));
        this.getInterfaces(meta).forEach((i: IConnector) => {
            i.updateLogs(layerId, featureId, logs, meta, () => { });
        });
    }

    public getFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.getFeature(layerId, featureId, meta, (result) => callback(result));
    }

    public updateFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        if (s) s.updateFeature(layerId, feature, true, meta, (result) => callback(result));
        this.getInterfaces(meta).forEach((i: IConnector) => {
            i.updateFeature(layerId, feature, false, meta, () => { });
        });
    }

    public deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.deleteFeature(layerId, featureId, meta, (result) => callback(result));
        this.getInterfaces(meta).forEach((i: IConnector) => {
            i.deleteFeature(layerId, featureId, meta, () => { });
        });
    }


    //log stuff (new: 26/7)

    public addLog(layerId: string, featureId: string, property: string, log: Log, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.addLog(layerId, featureId, property, log, meta, (result) => callback(result));
    }

    public initLayer(layer: Layer) {

    }

    public initProject(project: Project) {

    }

    public getLog(layerId: string, featureId: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.getLog(layerId, featureId, meta, (result) => callback(result));
    }

    public deleteLog(layerId: string, featureId: string, ts: number, prop: string, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.deleteLog(layerId, featureId, ts, prop, meta, (result) => callback(result));
    }

    //geospatial queries (thus only supported for mongo)

    public getBBox(layerId: string, southWest: number[], northEast: number[], meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.getBBox(layerId, southWest, northEast, meta, (result) => callback(result));
    }

    public getSphere(layerId: string, maxDistance: number, lng: number, lat: number, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.getSphere(layerId, maxDistance, lng, lat, meta, (result) => callback(result));
    }
    public getWithinPolygon(layerId: string, feature: Feature, meta: ApiMeta, callback: Function) {
        var s = this.findStorageForLayerId(layerId);
        s.getWithinPolygon(layerId, feature, meta, (result) => callback(result));
    }

    private keySubscriptions: { [pattern: string]: Function[] } = {};

    public subscribeKey(pattern: string, meta: ApiMeta, callback: Function) {
        if (!this.keySubscriptions.hasOwnProperty(pattern)) {

        }
    }

    public addKey(keyId: string, value: Object, meta: ApiMeta, callback: Function) {
        Winston.info('add key ' + keyId);
        this.keys[keyId] = <Key>{ id: keyId, title: keyId };
    }

    public getKeys(meta: ApiMeta, callback: Function) {
        // check subscriptions
        callback(<CallbackResult>{ result: ApiResult.OK, keys: this.keys });
    }

    public getKey(id: string, meta: ApiMeta, callback: Function) {
        // check subscriptions
        var key = this.findKey(id);
        var keys: { [keyId: string]: Key } = { id: key };
        callback(<CallbackResult>{ result: ApiResult.OK, keys: keys });
    }

    public updateKey(keyId: string, value: Object, meta?: ApiMeta, callback?: Function) {
        if (!meta) meta = <ApiMeta>{};
        if (!callback) callback = () => { };

        Winston.info('updatekey:received' + keyId);
        // check if keys exists
        var key = this.findKey(keyId);
        if (!key) {
            this.addKey(keyId, value, meta, callback);
        }

        if (!value.hasOwnProperty('time')) value['time'] = new Date().getTime();
        var s = this.findStorageForKeyId(keyId);
        if (s) s.updateKey(keyId, value, meta, () => callback());

        this.getInterfaces(meta).forEach((i: IConnector) => {
            Winston.info('updatekey:send to ' + i.id);
            i.updateKey(keyId, value, meta, () => { });
        });

        // check subscriptions
        callback(<CallbackResult>{ result: ApiResult.OK })
    }
    i
}
