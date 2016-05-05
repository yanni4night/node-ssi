/**
 * Copyright (C) 2016 yanni4night.com
 * set.js
 *
 * changelog
 * 2016-05-04[17:28:47]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
export const compile = params => {
    return `_ctx.${params.var}=\'${params.value}\';\n`;
};

/*export const parse = function (str, line, parser, types) {
    var value = false,
        variable = false;
    parser.on('start', function(){});
    parser.on('end', function(){});

    parser.on(types.VAR, function (token) {
        if (propertyName) {
            // Tell the parser where to find the variable
            propertyName += '_ctx.' + token.match;
            return;
        }

        switch (token.match) {
        case 'var':
            break;
        case 'value':
            break;
        default:
            throw new Error('Unexpected parameter "' + token.match + '" on line ' + line + '.');;
        }

        if (!parser.out.length) {
            nameSet += token.match;
            return;
        }

        return true;
    });

    parser.on(types.STRING, function (token) {
        if (propertyName && !this.out.length) {
            propertyName += token.match;
            return;
        }

        return true;
    });

    parser.on(types.ASSIGNMENT, function (token) {
        if (this.out.length || !nameSet) {
            throw new Error('Unexpected assignment "' + token.match + '" on line ' + line + '.');
        }

        this.out.push(
            // Prevent the set from spilling into global scope
            '_ctx.' + nameSet
        );
        this.out.push(token.match);
    });

    return true;
};*/

export const block = true;