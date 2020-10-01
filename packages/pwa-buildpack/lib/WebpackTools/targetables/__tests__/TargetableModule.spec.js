const TargetableModule = require('../TargetableModule');

test('constructs with a filename and a parent trackable', () => {
    TargetableModule.enableTracking();
    const trackFn = jest.fn();
    const filePath = './path/somewhere';
    const fakeModule = new TargetableModule(filePath, trackFn);
    fakeModule.track('uhhh');
    expect(trackFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: filePath, type: 'TargetableModule' }),
        'uhhh'
    );
    TargetableModule.disableTracking();
});

test('formats transforms with addTransform and then flushes them with flush', () => {
    const trackFn = jest.fn();
    const fileToTransform = './path/somewhere';
    const fakeModule = new TargetableModule(fileToTransform, trackFn);
    fakeModule.addTransform('babel', '/path/to/FakeBabelPlugin', {
        option1: 'door 1',
        option2: 'door 2'
    });
    fakeModule.addTransform('source', '/path/to/loader', {
        loaderOption1: 'no'
    });
    expect(fakeModule.flush()).toMatchObject([
        {
            type: 'babel',
            fileToTransform,
            transformModule: '/path/to/FakeBabelPlugin',
            options: {
                option1: 'door 1',
                option2: 'door 2'
            }
        },
        {
            type: 'source',
            fileToTransform,
            transformModule: '/path/to/loader',
            options: { loaderOption1: 'no' }
        }
    ]);

    // flush clears the queued transforms out
    expect(fakeModule.flush()).toHaveLength(0);
});
