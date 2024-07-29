function createCode(len) {
    let code = new String();
    for (let i = 0; i < len; i++) {
        code += String(parseInt(Math.random() * 10))
    };
    return code;
};

export {
    createCode
};