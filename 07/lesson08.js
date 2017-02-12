//Chapter 07
//temp 08

//绘制一个立方体
//1=> drawArrays => 绘制36个点
//2=> drawElements
// => 根据索引绘制图形
// => 顶点坐标与颜色一同传入

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        v_Color = a_Color;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

ready(loadWEBGL);

function loadWEBGL() {
    var canvas = document.getElementById('webgl');
    var webgl = canvas.getContext('webgl');
    
    if ( !initShaders(webgl, VSHADER_SOURCE, FSHADER_SOURCE) ) {
        console.log(new Error('failed to init shaders!'));
        return ;
    }

    // var n = initBufferAllVertexs(webgl);
    var n = initIndexBuffer(webgl);

    var viewMat = new Matrix4().setLookAt(3, 3, 7, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var modelMat = new Matrix4().setTranslate(0, 0, 0);

    var projMat = new Matrix4();
    projMat.setPerspective(30, canvas.width/canvas.height, 1.0, 100);

    var mvpMat = new Matrix4().setIdentity().multiply(projMat).multiply(viewMat).multiply(modelMat);
    var u_MvpMatrix = webgl.getUniformLocation(webgl.program, 'u_MvpMatrix');
    webgl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat.elements);

    webgl.enable(webgl.DEPTH_TEST);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    // webgl.drawArrays(webgl.TRIANGLES, 0, n);
    webgl.drawElements(webgl.TRIANGLES, n, webgl.UNSIGNED_BYTE, 0);
}


//画出所有面的所有三角形
//需要顶点个数36个
function initBufferAllVertexs (webgl) {
    var cubicAll36Vertexs = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, //v0 v1 v2
        1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //v0 v2 v3
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, //v0 v3 v4
        1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //v0 v4 v5
        1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, //v5 v6 v7
        1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, //v5 v7 v4
        -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, //v1 v2 v6
        -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, //v6 v2 v7
        1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, //v0 v6 v5
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, //v0 v1 v6
        1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, //v3 v7 v4
        1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0 //v3 v3 v7
    ]);

    var vertexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, cubicAll36Vertexs, webgl.STATIC_DRAW);
    var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
    webgl.vertexAttribPointer(a_Position, 3, webgl.FLOAT, false, 0, 0);
    webgl.enableVertexAttribArray(a_Position);

    return cubicAll36Vertexs.length/3;
}

//=> 使用索引
function initIndexBuffer (webgl) {
    var vertexDataAndColors = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //v0 white
        -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //v1 品红
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, //v2 红色
        1.0, -1.0, 1.0, 1.0, 1.0, 0.0, //v3 黄色
        1.0, -1.0, -1.0, 0.0, 1.0, 0.0, //v4
        1.0, 1.0, -1.0, 0.0, 1.0, 1.0, //v5
        -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, //v6
        -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 //v7 
    ]);

    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3, //front
        0, 3, 4, 0, 4, 5, //right
        0, 5, 6, 0, 6, 1, //up
        1, 6, 7, 1, 7, 2, //left
        7, 4, 3, 7, 3, 2, //bottom
        4, 7, 6, 4, 6, 5 //behind
    ]);

    var vertexColorBuffer = webgl.createBuffer();
    var indicesBuffer = webgl.createBuffer();

    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexColorBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, vertexDataAndColors, webgl.STATIC_DRAW);

    var FSIZE = vertexDataAndColors.BYTES_PER_ELEMENT;
    var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
    var a_Color = webgl.getAttribLocation(webgl.program, 'a_Color');
    webgl.vertexAttribPointer(a_Position, 3, webgl.FLOAT, false, FSIZE*6, 0);
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE*6, FSIZE*3);
    webgl.enableVertexAttribArray(a_Position);
    webgl.enableVertexAttribArray(a_Color);

    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indices, webgl.STATIC_DRAW);

    return indices.length;
}
