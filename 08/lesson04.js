//Chapter 08
//temp 03

//绘制一个立方体
// => 光照为点光源

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_VpMatrix; //view and range mat
    uniform mat4 u_ModelMatrix; //model mat
    uniform mat4 u_ReverseModelMat; //模型矩阵的逆转置
    attribute vec4 a_Normal; //法向量
    uniform vec3 u_LightColor; //光颜色强度
    uniform vec3 u_LightPosition; //光源位置
    uniform vec3 u_AmbientLight; // 环境光
    varying vec4 v_Color;
    void main() {
        gl_Position = u_VpMatrix * u_ModelMatrix * a_Position;

        //漫反射光颜色
        //法向量进行归一化
        vec3 normal = normalize(vec3(u_ReverseModelMat * a_Normal));
        //变化后的坐标 -> 世界坐标
        vec4 vertexPosition = u_ModelMatrix * a_Position;
        //光线方向并归一化
        vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
        //计算cos入射角 当角度大于90 说明光照在背面 赋值为0
        float nDotLight = max(dot(lightDirection, normal), 0.0);
        //计算反射光颜色
        vec3 diffuse = u_LightColor * a_Color.rgb * nDotLight;
        // 环境反射光颜色
        vec3 ambient = u_AmbientLight * a_Color.rgb;

        v_Color = vec4(diffuse + ambient, a_Color.a);
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

    var viewMat = new Matrix4().setLookAt(7, 2.5, 6, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var modelMat = new Matrix4().setIdentity();
    // var modelMat = new Matrix4().setTranslate(0, 1, 0).rotate(30, 0, 0, 1);

    var projMat = new Matrix4();
    projMat.setPerspective(30, canvas.width/canvas.height, 1.0, 100);

    var vpMat = new Matrix4().setIdentity().multiply(projMat).multiply(viewMat);
    var u_VpMatrix = webgl.getUniformLocation(webgl.program, 'u_VpMatrix');
    webgl.uniformMatrix4fv(u_VpMatrix, false, vpMat.elements);

    var u_ModelMatrix = webgl.getUniformLocation(webgl.program, 'u_ModelMatrix');
    webgl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);

    //************* */
    //model逆转置
    var reverseModelMat = new Matrix4().setInverseOf(modelMat); //求逆
    reverseModelMat.transpose(); //转置
    var u_ReverseModelMat = webgl.getUniformLocation(webgl.program, 'u_ReverseModelMat');
    webgl.uniformMatrix4fv(u_ReverseModelMat, false, reverseModelMat.elements);
    //************* */

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
    //设置点光源位置
    var u_LightPosition = webgl.getUniformLocation(webgl.program,'u_LightPosition');
    webgl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
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

    //设置环境光
    var u_AmbientLight = webgl.getUniformLocation(webgl.program, 'u_AmbientLight');
    webgl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    webgl.enable(webgl.DEPTH_TEST);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    // webgl.drawArrays(webgl.TRIANGLES, 0, n);
    webgl.drawElements(webgl.TRIANGLES, n, webgl.UNSIGNED_BYTE, 0);

    var tempRMatrix = new Matrix4().setInverseOf(modelMat);
    var tick = () => {
        var modelMat = animateRotate(webgl, 30);

        //model逆转置
        tempRMatrix.setInverseOf(modelMat); //求逆
        tempRMatrix.transpose(); //转置
        webgl.uniformMatrix4fv(u_ReverseModelMat, false, tempRMatrix.elements);
        //mvp矩阵
        webgl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);
        //************* */
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, n, webgl.UNSIGNED_BYTE, 0);        
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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
var CURRENT_ANGLE = 0;
var CURRENT_MODEL_MATRIX = new Matrix4();
var CURRENT_TIMESTAMP = Date.now();
function animateRotate (webgl, speed) {
    var now = Date.now();
    var interval = Date.now() - CURRENT_TIMESTAMP;
    CURRENT_TIMESTAMP = now;
    CURRENT_ANGLE += (interval * speed /  1000);//累加
    CURRENT_MODEL_MATRIX.setRotate(CURRENT_ANGLE, 0, 0, 1);
    return CURRENT_MODEL_MATRIX;
}