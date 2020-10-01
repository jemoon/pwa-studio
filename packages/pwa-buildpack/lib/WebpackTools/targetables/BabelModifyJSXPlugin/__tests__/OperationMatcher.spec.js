const babel = require('@babel/core');
const JSXSnippetParser = require('../JSXSnippetParser');
const OperationMatcher = require('../OperationMatcher');
const { MockBabelNodePath } = require('../../../../TestHelpers');

const parser = new JSXSnippetParser(babel, 'fake-file.js');

const mockPath = source => new MockBabelNodePath(source);
const operationOn = (element, params) =>
    new OperationMatcher(
        { options: { method: 'mockOperation', element, params } },
        parser
    );

describe('detects matching JSX elements with', () => {
    test('no attributes', () => {
        expect(
            operationOn('<div  />').matches(mockPath('<div/>'))
        ).toBeTruthy();
    });
    test('string attributes', () => {
        expect(
            operationOn('<Button a="b">').matches(
                mockPath('<Button c={d.g} a="b"></Button>')
            )
        ).toBeTruthy();
    });
    test('identifier attributes', () => {
        expect(
            operationOn('<Button a={value}>').matches(
                mockPath('<Button c={d.g} a={value}></Button>')
            )
        ).toBeTruthy();
    });
    test('dot lookup attributes', () => {
        expect(
            operationOn('<Button a={root.value}>').matches(
                mockPath('<Button c={d.g} a={root.value}></Button>')
            )
        ).toBeTruthy();
    });
    test('arbitrary expressions', () => {
        expect(
            operationOn('<span id={`${dot.path}`}>').matches(
                mockPath('<span id={`${dot.path}`}>pryvit</span>')
            )
        ).toBeTruthy();
    });
});

describe('rejects JSX elements which', () => {
    test('have missing attributes', () => {
        expect(
            operationOn('<Route path={somePath}>').matches(
                mockPath('<Route otherPath={somePath} />')
            )
        ).toBeFalsy();
    });
    test('have non-matching attributes', () => {
        expect(
            operationOn('<Route path={somePath}>').matches(
                mockPath('<Route path="someString" />')
            )
        ).toBeFalsy();
    });
    test('have too few attributes', () => {
        expect(
            operationOn('<Route path={somePath}>').matches(mockPath('<Route/>'))
        ).toBeFalsy();
    });
});

test('serializes all pretty', () => {
    const insertBefore = new OperationMatcher(
        {
            options: {
                method: 'insertBefore',
                element: 'span',
                params: {
                    jsx: '<i>yo</i>'
                }
            }
        },
        parser
    );

    expect(insertBefore.toString()).toMatchSnapshot();

    const remove = new OperationMatcher(
        {
            options: {
                method: 'remove',
                element: '<i>'
            }
        },
        parser
    );

    expect(remove.toString()).toMatchSnapshot();
});
