//Chapter 07
//Temp 06

//透视投影范围
// 共冶一炉: PorjMatrix * ViewMatrix * ModelMatrix
// 多次绘制图形 drawArrays执行多次即可

//vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    // uniform mat4 u_ModelMatrix; //模型矩阵
    // uniform mat4 u_ViewMatrix; //视图矩阵
    // uniform mat4 u_ProjMatrix; //盒状可视范围
    uniform mat4 u_MVPMatrix; //js中计算的结果矩阵
    varying vec4 v_Color;
    void main() {
        // gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        gl_Position = u_MVPMatrix * a_Position;
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

    var ex = 0.0, ey = 0.0, ez = 5.0;
    // setViewMatrix(webgl, ex, ey, ez);
    // setPersProjMatrix(webgl, fov, aspect, near, far);

    //视图矩阵
    var viewMat = new Matrix4();
    viewMat.setLookAt(ex, ey, ez, 0.0, 0.0, -100, 0.0, 1.0, 0.0);
    //范围矩阵
    var fov = 30, aspect = canvas.width/canvas.height;
    var near = 1.0, far = 100.0;
    var projMat = new Matrix4();
    projMat.setPerspective(fov, aspect, near, far);
    //模型矩阵
    var modelMat = new Matrix4();
    var tx = 0.75, ty = 0.0, tz = 0.0;
    modelMat.setTranslate(tx, ty, tz);

    // => 在shader中计算
    // setUniMat(webgl, 'u_ViewMatrix', viewMat);
    // setUniMat(webgl, 'u_ProjMatrix', projMat);
    // setUniMat(webgl, 'u_ModelMatrix', modelMat);

    // => 在js中计算 避免性能浪费
    var mvpMatrix = new Matrix4();
    mvpMatrix.set(projMat).multiply(viewMat).multiply(modelMat);
    setUniMat(webgl, 'u_MVPMatrix', mvpMatrix);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);

    //绘制右边
    webgl.drawArrays(webgl.TRIANGLES, 0, n);

    //绘制左边
    modelMat.setTranslate(-tx, ty, tz);
    mvpMatrix.set(projMat).multiply(viewMat).multiply(modelMat);
    setUniMat(webgl, 'u_MVPMatrix', mvpMatrix);    
    webgl.drawArrays(webgl.TRIANGLES, 0, n);   
}

function initBuffer (webgl) {
    var vertexData = new Float32Array([
        //顶点坐标颜色
        0.0, 0.5, -4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -4, 0.4, 1.0, 0.4,
        0.5, -0.5, -4, 1.0, 0.4, 0.4,

        0.0, 0.5, -2, 1.0, 0.4, 0.4,
        -0.5,-0.5, -2, 1.0, 1.0, 0.4,
        0.5, -0.5, -2, 1.0, 1.0, 0.4,

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

/*
// 设置盒装可视范围矩阵
// function setBoxProjMatrix (webgl, near, far) {
//     var u_ProjMatrix = webgl.getUniformLocation(webgl.program, 'u_ProjMatrix');
//     var projMatrix = new Matrix4();
//     projMatrix.setOrtho(-1, 1, -1, 1, near, far);
//     webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

//     return (near, far) => {
//         projMatrix.setOrtho(-1, 1, -1, 1, near, far);
//         webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
//     };
// }

// 设置投影可视范围矩阵
// function setPersProjMatrix (webgl, fov, aspect, near, far) {
//     var u_ProjMatrix = webgl.getUniformLocation(webgl.program, 'u_ProjMatrix');
//     var projMatrix = new Matrix4();
//     projMatrix.setPerspective(fov, aspect, near, far);
//     webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

//     return (near, far) => {
//         projMatrix.setPerspective(fov, aspect, near, far);
//         webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
//     };
// }

// 设置视图矩阵
// function setViewMatrix (webgl, ex, ey, ez) {
//     var u_ViewMatrix = webgl.getUniformLocation(webgl.program, 'u_ViewMatrix');
//     var viewMatrix = new Matrix4();
//     viewMatrix.setLookAt(ex, ey, ez, 0.0, 0.0, -100, 0.0, 1.0, 0.0);
//     webgl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

//     return (ex, ey, ez) => { 
//         viewMatrix.setLookAt(ex, ey, ez, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
//         webgl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
//     };
// }

// 设置模型矩阵
// function setTranslateMatrix (webgl, tx, ty, tz) {
//     var u_ModelMatrix = webgl.getUniformLocation(webgl.program, 'u_ModelMatrix');
//     var modelMatrix = new Matrix4();
//     modelMatrix.setTranslate(tx, ty, tz);
//     webgl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

//     return (tx, ty, tz) => { 
//         modelMatrix.setTranslate(tx, ty, tz);
//         webgl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
//     };
// }
*/

// 优化代码 对指定着色器变量-矩阵赋值
function setUniMat ( webgl, name, mat ) {
    var uniformMat = webgl.getUniformLocation(webgl.program, name);
    webgl.uniformMatrix4fv(uniformMat, false, mat.elements);        
}