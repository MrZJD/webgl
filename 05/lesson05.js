////Chapter 5
//Temp 05

//使用多个纹理

// 顶点着色器程序
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TextCoord;
    varying vec2 v_TextCoord;
    void main() {
        gl_Position = a_Position;
        v_TextCoord = a_TextCoord;
    }
`;

// 片元着色器程序
var FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler1; //2d纹理存储格式
    uniform sampler2D u_Sampler2;
    varying vec2 v_TextCoord;
    void main() {
        vec4 color1 = texture2D(u_Sampler1, v_TextCoord);
        vec4 color2 = texture2D(u_Sampler2, v_TextCoord);
        gl_FragColor = color1 * color2;
        // gl_FragColor = texture2D(u_Sampler1, v_TextCoord);
    }
`;

ready(() => {
    var canvas = document.getElementById('webgl');
    if ( !canvas ) {
        console.error('Failed to get dom-element:webgl!');
        return ;
    }

    var webgl = canvas.getContext('webgl');
    if ( !webgl ) {
        console.error('Failed to get webgl-context');
        return ;
    }

    if ( !initShaders( webgl, VSHADER_SOURCE, FSHADER_SOURCE) ) {
        console.error('Failed to init shaders!');
        return ;
    }

    webgl.clearColor(0, 0, 0, 0.6);

    var n = initBuffer(webgl);
    if ( n < 0 ) {
        console.error('Failed to init buffer!');
        return ;
    }

    //图片加载成功后 => 进行纹理加载
    Promise.all([
        loadImage('http://localhost:8080/webgl/static/sky.jpg'),
        loadImage('http://localhost:8080/webgl/static/circle.gif')
    ])
     .then(function(imgs){
         loadTexture(webgl, imgs);
     })
     .then(() => {
         draw(webgl, n);
     });
});

// 缓冲器
function initBuffer (webgl) {
    var attrData = new Float32Array([
        //顶点坐标  纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);
    var n = attrData.length / 4;
    var FSIZE = attrData.BYTES_PER_ELEMENT;

    var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, attrData, webgl.STATIC_DRAW);

    var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
    var a_TextCoord = webgl.getAttribLocation(webgl.program, 'a_TextCoord');
    if ( a_Position < 0 || a_TextCoord < 0 ) {
        console.error('Failed to get attribute location!');
        return -1;
    }
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, FSIZE*4, 0);
    webgl.vertexAttribPointer(a_TextCoord, 2, webgl.FLOAT, false, FSIZE*4, FSIZE*2);
    webgl.enableVertexAttribArray(a_Position);
    webgl.enableVertexAttribArray(a_TextCoord);

    return n;
}

// 图片加载
function loadImage (url) {
    return new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = () => { resolve(img) };
        img.onerror = (e) => { console.error('Failed to load image!'); reject(e)};
        img.src = url;
    });
}

// 纹理加载器
function loadTexture (webgl, images) {
    var tLen = images.length;
    var textures = [];
    var samplers = [];
    console.log(tLen);
    for (let i=0; i<tLen; i++) {
        // 创建纹理对象
        textures.push( webgl.createTexture() );
        // 获取纹理的存储位置
        samplers.push( webgl.getUniformLocation(webgl.program, 'u_Sampler'+i) );
    }
    //对纹理进行Y轴反转
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 1);
    for (let i=0; i<tLen; i++) {
        //开启纹理单元
        webgl.activeTexture( webgl['TEXTURE'+i] );
        //向target绑定纹理对象
        webgl.bindTexture(webgl.TEXTURE_2D, textures[i]);
        //配置纹理参数
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
        //配置纹理图像
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, images[i]);
        //将纹理单元传递给着色器
        webgl.uniform1i(samplers[i], i);
    }
}

// 最终绘图
function draw (webgl, n) {
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, n);
} 