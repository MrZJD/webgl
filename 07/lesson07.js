//Chapter 7
//Temp 07

//隐藏面消除
// webgl.enable(webgl.DEPTH_TEST);
// webgl.clear(webgl.DEPTH_BUFFER_BIT);

//多边形偏移解决深度冲突
// webgl.enable(webgl.POLYGON_OFFSET_FILL);
// webgl.polygonOffset(1.0, 1.0);

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_AllMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_AllMatrix * a_Position;
        v_Color = a_Color;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

ready(loadWEBGL);

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

    // => 在js中计算 避免性能浪费
    var mvpMatrix = new Matrix4();
    mvpMatrix.set(projMat).multiply(viewMat).multiply(modelMat);
    setUniMat(webgl, 'u_AllMatrix', mvpMatrix);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.enable(webgl.DEPTH_TEST);
    webgl.clear(webgl.DEPTH_BUFFER_BIT);

    //绘制右边
    webgl.drawArrays(webgl.TRIANGLES, 0, n);
}

function initBuffer (webgl) {
    //隐藏面擦出示例数据
    var vertexData = new Float32Array([
        //顶点坐标颜色
        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,

        0.0, 0.5, -2, 1.0, 0.4, 0.4,
        -0.5,-0.5, -2, 1.0, 1.0, 0.4,
        0.5, -0.5, -2, 1.0, 1.0, 0.4,

        0.0, 0.5, -4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -4, 0.4, 1.0, 0.4,
        0.5, -0.5, -4, 1.0, 0.4, 0.4
    ]);
    //深度冲突示例数据
    var vertexData2 = new Float32Array([
        0.0, 2.5, -5.0, 0.0, 1.0, 0.0,//黄色
        -2.5, -2.5, -5.0, 0.0, 1.0, 0.0,
        2.5, -2.5, -5.0, 1.0, 0.0, 0.0,

        0.0, 3.0, -5.0, 1.0, 0.0, 0.0,//绿色
        -3.0, -3.0, -5.0, 1.0, 1.0, 0.0,
        3.0, -3.0, -5.0, 1.0, 1.0, 0.0,        
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

// 优化代码 对指定着色器变量-矩阵赋值
function setUniMat ( webgl, name, mat ) {
    var uniformMat = webgl.getUniformLocation(webgl.program, name);
    webgl.uniformMatrix4fv(uniformMat, false, mat.elements);        
}