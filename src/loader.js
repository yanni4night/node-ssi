/**
 * Copyright (C) 2016 tieba.baidu.com
 * loader.js
 *
 * changelog
 * 2016-04-17[12:21:16]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import * as fs from 'fs';

export const load = (filePath, opts) => {
        return fs.readFileSync(filePath, opts);
};