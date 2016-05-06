/**
  * Copyright (C) 2016 tieba.baidu.com
  * lexer.js
  *
  * changelog
  * 2016-04-17[11:36:26]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */

export const TYPES = {
    /** Whitespace */
    WHITESPACE: 0,
    /** Plain string */
    STRING: 1,
    /** Variable */
    VAR: 9,
    /** Variable assignment */
    ASSIGNMENT: 24,
    /** Unknown type */
    UNKNOWN: 100
};

const RULES = [{
    type: TYPES.WHITESPACE,
    regex: [
        /^\s+/
    ]
}, {
    type: TYPES.STRING,
    regex: [
        /^""/,
        /^".*?[^\\]"/,
        /^''/,
        /^'.*?[^\\]'/
    ]
}, {
    type: TYPES.VAR,
    regex: [
        /^[a-zA-Z_$]\w*/
    ]
}, {
    type: TYPES.ASSIGNMENT,
    regex: [
        /^(=)/
    ]
}, {
    type: TYPES.NUMBER,
    regex: [
        /^[+\-]?\d+(\.\d+)?/
    ]
}];

const reader = str => {
    let matched;

    RULES.some(rule => {
        return rule.regex.some(regex => {
            let match = str.match(regex),
                normalized;

            if (!match) {
                return;
            }

            normalized = match[rule.idx || 0].replace(/\s*$/, '');
            normalized = (rule.hasOwnProperty('replace') && rule.replace.hasOwnProperty(normalized)) ?
                rule.replace[normalized] : normalized;

            matched = {
                match: normalized,
                type: rule.type,
                length: match[0].length
            };
            return true;
        });
    });

    if (!matched) {
        matched = {
            match: str,
            type: TYPES.UNKNOWN,
            length: str.length
        };
    }

    return matched;
};

export const read = str => {
  let offset = 0,
    tokens = [],
    substr,
    match;
  while (offset < str.length) {
    substr = str.substring(offset);
    match = reader(substr);
    offset += match.length;
    tokens.push(match);
  }
  return tokens;
};