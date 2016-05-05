/**
  * Copyright (C) 2016 yanni4night.com
  * echo.js
  *
  * changelog
  * 2016-05-05[18:33:32]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */
export const compile = params => {
    return `_output+=_ctx.${params.var}||"";\n`;
};