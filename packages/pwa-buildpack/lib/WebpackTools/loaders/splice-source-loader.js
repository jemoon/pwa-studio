const { inspect } = require('util');

class SpliceError extends Error {
    constructor(message, instruction) {
        super(
            `Invalid splice instruction:\n\n${inspect(instruction, {
                compact: false
            })}\n\n${message}`
        );
    }
}

const spliceSource = (source, index, insert, remove) => {
    const left = source.slice(0, index);
    let right = source.slice(index);
    if (remove) {
        right = right.slice(remove);
    }
    if (insert) {
        right = insert + right;
    }
    return left + right;
};

const isNonNegativeInt = num => Number.isSafeInteger(num) && num >= 0;
const isNonEmptyString = str => typeof str === 'string' && str.length > 0;

const instructionTypes = ['after', 'at', 'before'];

function spliceSourceLoader(content) {
    return this.query.reduce((source, instr) => {
        const nope = msg => {
            this.emitError(new SpliceError(msg, instr));
            return source;
        };

        const spliceAt = pos =>
            spliceSource(source, pos, instr.insert, instr.remove);

        const hasInsert = instr.hasOwnProperty('insert');
        const hasRemove = instr.hasOwnProperty('remove');
        if (!(hasInsert || hasRemove)) {
            return nope('Nothing to insert or remove.', instr);
        }

        if (hasInsert && typeof instr.insert !== 'string') {
            return nope('An "insert" property must be a string.');
        }

        if (hasRemove && !isNonNegativeInt(instr.remove)) {
            return nope(
                'A "remove" property must be an integer greater than or equal to 0.'
            );
        }

        const found = instructionTypes.filter(type =>
            instr.hasOwnProperty(type)
        );
        if (found.length !== 1) {
            return nope(
                `Must have one and only one of the options ${inspect(
                    instructionTypes
                )}.`
            );
        }

        const [instructionType] = found;
        const value = instr[instructionType];

        switch (instructionType) {
            case 'at': {
                return isNonNegativeInt(value)
                    ? spliceAt(value)
                    : nope(
                          'An "at" property must be an integer greater than or equal to 0.'
                      );
            }
            case 'before': {
                if (!isNonEmptyString(value)) {
                    return nope(
                        `A "before" property must be a non-empty string.`
                    );
                }
                const pos = source.indexOf(value);
                return pos === -1
                    ? nope(`The text "${value}" was not found.`)
                    : spliceAt(pos);
            }
            case 'after': {
                if (!isNonEmptyString(value)) {
                    return nope(
                        `An "after" property must be a non-empty string.`
                    );
                }
                const pos = source.indexOf(value);
                return pos === -1
                    ? nope(`The text "${value}" was not found.`)
                    : spliceAt(pos + value.length);
            }
            default:
                return source;
        }
    }, content);
}

module.exports = spliceSourceLoader;
