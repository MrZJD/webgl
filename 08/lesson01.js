//Chapter 08
//temp 01

//绘制一个立方体 加光照
// 平行光光照 + 漫反射光
// 下一节加上环境反射光

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    attribute vec4 a_Normal; //法向量
    uniform vec3 u_LightColor; //光照颜色
    uniform vec3 u_LightDirection; //光照方向 //=归一化后的世界坐标
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;

        //法向量进行归一化
        vec3 normal = normalize(vec3(a_Normal));
        //计算cos入射角 当角度大于90 说明光照在背面 赋值为0
        float nDotLight = max(dot(u_LightDirection, normal), 0.0);
        //计算反射光颜色
        vec3 diffuse = u_LightColor * vec3(a_Color) * nDotLight;
        v_Color = vec4(diffuse, a_Color.a);
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

    var viewMat = new Matrix4().setLookAt(3, 3, 7, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var modelMat = new Matrix4().setTranslate(0, 0, 0);

    var projMat = new Matrix4();
    projMat.setPerspective(30, canvas.width/canvas.height, 1.0, 100);

    var mvpMat = new Matrix4().setIdentity().multiply(projMat).multiply(viewMat).multiply(modelMat);
    var u_MvpMatrix = webgl.getUniformLocation(webgl.program, 'u_MvpMatrix');
    webgl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat.elements);

    // data
    var vertexData = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //front面 v0-4
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //right v0345
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //up v0561
        -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, //left 
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, //down
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0 //back
    ]);

    var colorData = new Float32Array([
        0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, //front
        0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, //right
        1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, //up
        1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, //left
        1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, //btm
        0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0 //back
    ]);

    var colorData_ALLWHITE = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 
    ]);

    var indicesData = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    initArrayBuffer(webgl, vertexData, 'a_Position', 3, webgl.FLOAT);
    initArrayBuffer(webgl, colorData_ALLWHITE, 'a_Color', 3, webgl.FLOAT);
    initIndexBuffer(webgl, indicesData);
    var n = indicesData.length;

    //设置光照颜色
    var u_LightColor = webgl.getUniformLocation(webgl.program, 'u_LightColor');
    webgl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    //设置光照方向
    var u_LightDirection = webgl.getUniformLocation(webgl.program,'u_LightDirection');
    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();
    webgl.uniform3fv(u_LightDirection, lightDirection.elements);
    //通过设置顶点的法向量 确定面的法向量
    var normalData = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);
    initArrayBuffer(webgl, normalData, 'a_Normal', 3, webgl.FLOAT);

    webgl.enable(webgl.DEPTH_TEST);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    // webgl.drawArrays(webgl.TRIANGLES, 0, n);
    webgl.drawElements(webgl.TRIANGLES, n, webgl.UNSIGNED_BYTE, 0);

    var tempMatrix = new Matrix4().setIdentity().multiply(projMat).multiply(viewMat);
    var tick = () => {
        var mat = animateRotate(webgl, 30);
        var mvpMat = tempMatrix.multiply(mat);
        webgl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat.elements);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, n, webgl.UNSIGNED_BYTE, 0);        
        requestAnimationFrame(tick);
    };
    // requestAnimationFrame(tick);
}

// 初始化顶点缓冲区
// 坐标值 或者 颜色值
function initArrayBuffer (webgl, data, name, num, type) {
    var vertexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, data, webgl.STATIC_DRAW);
    var vertexLoction = webgl.getAttribLocation(webgl.program, name);
    webgl.vertexAttribPointer(vertexLoction, num, type, false, 0, 0);
    webgl.enableVertexAttribArray(vertexLoction);
    return true;
}

//=> 使用索引
function initIndexBuffer (webgl, indexData) {
    var indicesBuffer = webgl.createBuffer();

    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexData, webgl.STATIC_DRAW);

    return true;
}

//=> 添加一个动画
// return rotate 矩阵
var CURRENT_MODEL_MATRIX = new Matrix4();
var CURRENT_TIMESTAMP = Date.now();
function animateRotate (webgl, speed) {
    var now = Date.now();
    var interval = now - CURRENT_TIMESTAMP;
    CURRENT_TIMESTAMP = now;
    var angle = (interval * speed /  1000);
    //之所以不累加是因为
    CURRENT_MODEL_MATRIX.setRotate(angle, 0, -1, 0);
    return CURRENT_MODEL_MATRIX;
}