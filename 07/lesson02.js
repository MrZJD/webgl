//Chapter 07
//Temp 02

//对3d坐标进行变化 + 视点

//vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    // uniform mat4 u_ViewMatrix; //视图
    // uniform mat4 u_ModelMatrix; //模型
    uniform mat4 u_ViewModelMatrix; //计算后结果
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ViewModelMatrix * a_Position;
        v_Color = a_Color;
    }
`;

//fragment shader
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

//main
ready(loadWEBGL);

//主程序
function loadWEBGL () {
    var canvas = document.getElementById('webgl');
    if ( !canvas ) {
        console.error('Failed to get canvas-element!');
        return ;
    }

    var webgl = canvas.getContext('webgl');
    if ( !webgl ) {
        console.error('Failed to get canvas context: webgl!');
        return ;
    }

    if ( !initShaders(webgl, VSHADER_SOURCE, FSHADER_SOURCE) ) {
        console.error('Failed to init shaders!');
        return ;
    }

    var n = initBuffer(webgl);
    if ( n < 0 ) {
        console.error('Failed to init buffer!');
        return ;
    }

    // setViewMatrix(webgl);
    // setModelMatrix(webgl);
    setViewModel(webgl);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES, 0, n);
}

function initBuffer (webgl) {
    var vertexData = new Float32Array([
        //顶点坐标颜色
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ]);
    var n = vertexData.length/6;
    var FSIZE = vertexData.BYTES_PER_ELEMENT;

    var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
    var a_Color = webgl.getAttribLocation(webgl.program, 'a_Color');

    var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, vertexData, webgl.STATIC_DRAW);
    webgl.vertexAttribPointer(a_Position, 3, webgl.FLOAT, false, FSIZE*6, 0);
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE*6, FSIZE*3);
    webgl.enableVertexAttribArray(a_Position);
    webgl.enableVertexAttribArray(a_Color);

    return n;
}

// 设置视图矩阵
function setViewMatrix (webgl) {
    var u_ViewMatrix = webgl.getUniformLocation(webgl.program, 'u_ViewMatrix');

    //设置视点 视线 上方向
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(-0.20, 0.05, 0.25, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    
    webgl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
}

// 设置变化模型矩阵
function setModelMatrix (webgl) {
    var u_ModelMatrix = webgl.getUniformLocation(webgl.program, 'u_ModelMatrix');

    var modelMatrix = new Matrix4();
    var angle = 90;
    modelMatrix.setRotate(angle, 0, 0, 1);

    webgl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
}

// 设置视图模型相乘后的结果
function setViewModel (webgl) {
    var u_ViewModelMatrix = webgl.getUniformLocation(webgl.program, 'u_ViewModelMatrix');

    var viewModelMat = new Matrix4();
    viewModelMat.setLookAt(-0.20, 0.05, 0.25, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var angle = 90;
    viewModelMat.rotate(angle, 0, 0, 1);

    webgl.uniformMatrix4fv(u_ViewModelMatrix, false, viewModelMat.elements);
}