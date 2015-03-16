module HeatmapEditorView { export var html = '<div class="modal-content">    <div class="modal-header">        <button type="button" class="close" data-ng-click="vm.cancel()" aria-hidden="true">&times;</button>        <h3 class="modal-title" translate>HEATMAP.EDITOR_TITLE</h3>    </div>    <div class="modal-body container-fluid">        <div class="row-fluid">            <input type="text" class="pull-left" data-ng-model="vm.heatmap.title" style="margin: 0 5px" placeholder="{{ \'HEATMAP.TITLE\' | translate }}" />        </div>        <h4 class="row-fluid" style="margin-top: 5px;" translate>HEATMAP.MAIN_FEATURE</h4>        <!--<select data-ng-model="vm.selectedFeatureType"                data-ng-change="vm.loadPropertyTypes()"                data-ng-options="item as item.name for (key, item) in vm.dataset.featureTypes"                class="form-control row-fluid"></select>-->        <h4 class="row-fluid" translate>HEATMAP.PROPERTIES</h4>        <ul class="form-group row-fluid" style="margin-top: 1em; margin-left: -2em; overflow-y: auto; overflow-x: hidden;"            resize resize-y="450">            <li ng-repeat="hi in vm.heatmap.heatmapItems"                class="row-fluid list-unstyled truncate">                <div style="padding: 5px 0;" class="row-fluid"><!--                    name="vm.selectedTitles[]" value="{{hi.title}}"-->                    <input type="checkbox"                            data-ng-checked="hi.isSelected"                           data-ng-click="hi.select()">&nbsp;&nbsp;{{hi.toString()}}                </div>            </li>        </ul>    </div>    <div class="modal-footer">        <button type="button" class="btn btn-warning" data-ng-click="vm.cancel()" translate>CANCEL_BTN</button>        <button type="button" class="btn btn-primary" data-ng-click="vm.save()" translate>OK_BTN</button>    </div></div>'; }