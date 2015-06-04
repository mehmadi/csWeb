describe('Project', function() {
    it('Should construct a new project', () => {
        var p = new csComp.Services.Project();
        expect(p).toBeDefined();
    });

    var project: csComp.Services.Project;
    beforeEach(() => {
        project = new csComp.Services.Project();
    });

    describe('initial state', () => {
        it('Should have an empty markers object', function() {
            expect(project.markers).toEqual({});
        });

        it('Should have an empty groups object', function() {
            expect(project.groups).toBeUndefined();
        });

        describe('setting stuff after initialization', () => {
            it('Should set stuff properly', function() {
                project.id = 'newName';
                expect(project.id).toEqual('newName');
            });

            it('Should still work after serialization', function() {
                project.id = 'newName';
                var result = project.serialize();
                expect(result).toContain('newName');
            });
        });
    });

});
