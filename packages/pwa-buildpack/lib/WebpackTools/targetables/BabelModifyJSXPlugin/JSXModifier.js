const JSXSnippetParser = require('./JSXSnippetParser');
const OperationMatcher = require('./OperationMatcher');

const methods = {
    append(params, path) {
        path.pushContainer('children', [this.parseJSXParam(params)]);
    },
    insertAfter(params, path) {
        path.insertAfter(this.parseJSXParam(params));
    },
    insertBefore(params, path) {
        path.insertBefore(this.parseJSXParam(params));
    },
    prepend(params, path) {
        path.unshiftContainer('children', [this.parseJSXParam(params)]);
    },
    remove(_, path) {
        path.remove();
    },
    removeProps({ props }, path) {
        const toRemove = new Set(props);
        path.get('openingElement.attributes').forEach(
            propPath =>
                toRemove.has(propPath.node.name.name) && propPath.remove()
        );
    },
    replace(params, path) {
        path.replaceWith(this.parseJSXParam(params));
    },
    setProps({ props }, path) {
        const remainingToSet = new Map(Object.entries(props));
        const openingElement = path.get('openingElement');
        openingElement.get('attributes').forEach(propPath => {
            const { name } = propPath.node.name;
            const valuePath = propPath.get('value');
            if (remainingToSet.has(name)) {
                const newValue = remainingToSet.get(name);
                if (newValue === true) {
                    valuePath.remove(); // true just means present
                } else {
                    valuePath.replaceWithSourceString(newValue);
                }
                remainingToSet.delete(name);
            }
        });
        // create remaining props that weren't present and therefore deleted
        const newProps = this.parser.parseAttributes(remainingToSet.entries());
        if (newProps.length > 0) {
            openingElement.node.attributes.push(...newProps);
        }
    },
    surround(params, path) {
        const wrapperAST = this.parseJSXParam(params);
        wrapperAST.children = [path.node];
        path.replaceWith(wrapperAST);
    }
};

class JSXModifier {
    constructor(requests, babel, visitor) {
        this.parser = new JSXSnippetParser(babel, visitor.filename);
        this.visitor = visitor;
        this.operations = requests.map(
            request => new OperationMatcher(request, this.parser)
        );
        this.unmatchedOperations = new Set(this.operations);
        this.visited = new WeakMap();
        this.visitor.file.metadata.warnings = [];
    }

    runMatchingOperations(openingPath) {
        const path = openingPath.parentPath;
        for (const operation of this.operations) {
            const hasAlreadyRun = this.visited.get(path.node) || new Set();
            if (operation.matches(path) && !hasAlreadyRun.has(operation)) {
                this.unmatchedOperations.delete(operation);
                this.runOperation(operation, path);
                hasAlreadyRun.add(operation);
                if (path.removed) {
                    break;
                }
                this.visited.set(path.node, hasAlreadyRun);
            }
        }
    }

    parseJSXParam(params) {
        return this.parser.parseElement(
            this.parser.normalizeElement(params.jsx)
        );
    }

    runOperation(operation, path) {
        if (methods.hasOwnProperty(operation.method)) {
            return this[operation.method](operation.params, path, operation);
        }
        throw new Error(
            `Invalid operation ${operation}: operation name "${
                operation.method
            }" unrecognized`
        );
    }

    warnUnmatchedOperations() {
        const { warnings } = this.visitor.file.metadata;
        for (const operation of this.unmatchedOperations) {
            warnings.push(
                `JSX operation:\n\n${operation}\n\nnever found an element matching '${
                    operation.matcher
                }'`
            );
        }
    }
}

Object.assign(JSXModifier.prototype, methods);

module.exports = JSXModifier;
