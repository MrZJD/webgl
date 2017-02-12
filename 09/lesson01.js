//Chapter09
//temp 01

//jointModel - 单关节模型

var VSHADER = `
    attribute vec4 a_Position;
    // attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ReverseMatrix;
    // varying vec4 v_Position;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    void main () {
        gl_Position = u_MvpMatrix * a_Position;
        
        //光照计算
        //法向量
        v_Normal = normalize( vec3(u_ReverseMatrix * a_Normal) );
        //变化坐标
        // v_Position = u_ModelMatrix * a_Position;

        v_Color = vec4(1.0, 0.4, 0.0, 1.0);
    }
`;

var FSHADER = `
    precision mediump float;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightDirection;
    uniform vec3 u_AmbientLight;
    // varying vec4 v_Position;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    void main () {
        //cos
        float cosLight = max( dot(u_LightDirection, v_Normal), 0.0 );
        //光颜色
        vec3 lightColor = u_LightColor * v_Color.rgb * cosLight;
        //环境光
        vec3 ambientColor = u_AmbientLight * v_Color.rgb;

        gl_FragColor = vec4( lightColor + ambientColor, v_Color.a);
    }
`;

var VSHADER_TEST = `
    attribute vec4 a_Position;
    // attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    // uniform mat4 u_ModelMatrix;
    // uniform mat4 u_ReverseMatrix;
    // varying vec4 v_Position;
    varying vec4 v_Color;
    // varying vec3 v_Normal;
    void main () {
        // gl_Position = a_Position;
        gl_Position = u_MvpMatrix * a_Position;
        
        //光照计算
        //法向量
        // v_Normal = normalize( vec3(u_ReverseMatrix * a_Normal) );
        //变化坐标
        // v_Position = u_ModelMatrix * a_Position;

        v_Color = vec4(1.0, 0.4, 0.0, 1.0);
    }
`;

var FSHADER_TEST = `
    precision mediump float;
    // uniform vec3 u_LightColor;
    // uniform vec3 u_LightDirection;
    // uniform vec3 u_AmbientLight;
    // varying vec4 v_Position;
    varying vec4 v_Color;
    // varying vec3 v_Normal;
    void main () {
        //cos
        // float cosLight = max( dot(u_LightDirection, v_Normal), 0.0 );
        //光颜色
        // vec3 lightColor = u_LightColor * v_Color.rgb * cosLight;
        //环境光
        // vec3 ambientColor = u_AmbientLight * v_Color.rgb;

        gl_FragColor = v_Color;
        // gl_FragColor = vec4( lightColor + ambientColor, v_Color.a);
    }
`;

var vertexData = {
    position : new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
        1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
        1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
        -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
        -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
        1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ]),
    normal : new Float32Array([
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ]),
    color : new Float32Array([]),
    indices : new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ])
};

var mvpMat = {
    model : new Matrix4().setIdentity(),
    view : new Matrix4().setLookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0),
    pres : new Matrix4().setPerspective(50.0, 1, 1.0, 100),
    pv : function () {
        return new Matrix4().setIdentity().multiply(this.pres)
                                    .multiply(this.view);
    },
    mvp : function () {
        return new Matrix4().setIdentity().multiply(this.pres)
                                            .multiply(this.view)
                                            .multiply(this.model);
    }
};

var light = {
    lightColor : new Vector3([1.0, 1.0, 1.0]),
    lightDir : new Vector3([0.5, 3.0, 4.0]),
    AmbientLight : new Vector3([0.2, 0.2, 0.2])
}

function loadWEBGL () {
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl');

    if ( !initShaders(gl, VSHADER, FSHADER) ) {
        console.error('Failed to init shaders!');
        return ;
    }

    //1=>初始化缓冲区
    initArrayBuffer(gl, vertexData.position, 'a_Position', 3, gl.FLOAT);
    // initArrayBuffer(gl, vertexData.color, 'a_Color', 3, gl.FLOAT);
    initArrayBuffer(gl, vertexData.normal, 'a_Normal', 3, gl.FLOAT);
    initElementBuffer(gl, vertexData.indices);
    // 2=>设置模型视图范围矩阵
    setMVPMatrix(gl, mvpMat);
    // 3=>设置光照
    initParLight(gl, light);
    //4=>画图
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var n = vertexData.indices.length;

    var layer = {
        armAngle : 0.0,
        jointAngle : 0.0,
        armLength : 10.0,
        angleStep : 3.0
    }

    //1=>bindEvent
    bindKeydown(gl, mvpMat, layer, n);
    //2=>画层次模型
    drawLayer(gl, mvpMat, layer, n);
}

// 初始化缓冲区array_buffer数据
function initArrayBuffer (gl, data, name, num, type) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(loc, num, type, false, 0, 0);
    gl.enableVertexAttribArray(loc);
    return true;
}
// 初始化缓冲区element_array_buffer数据
function initElementBuffer (gl, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return true;
}

// 设置模型视图范围矩阵
function setMVPMatrix (gl, mvpMat) {
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat.mvp().elements);

    //model触发逆转置矩阵变化
    setReverseMat(gl, mvpMat.model);

    return true;
}

// 初始化平行光源和环境光源
function initParLight (gl, light) {
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    gl.uniform3fv(u_LightColor, light.lightColor.elements);
    gl.uniform3fv(u_LightDirection, new Vector3(light.lightDir.elements).normalize().elements);
    gl.uniform3fv(u_AmbientLight, light.AmbientLight.elements);

    return true;
}

// 设置变化矩阵 => 引起mvp发生变化
function setReverseMat (gl, modelMat) {
    var u_ReverseMatrix = gl.getUniformLocation(gl.program, 'u_ReverseMatrix');
    gl.uniformMatrix4fv(u_ReverseMatrix, false, new Matrix4().setInverseOf(modelMat).transpose().elements);
    return true;
}

// 设置键盘监听
function bindKeydown (gl, mvpMat, layer, n) {
    document.onkeydown = function(evt) {
        switch ( evt.keyCode ) {
            case 38 : //up
                if ( layer.jointAngle < 135.0 ) {
                    layer.jointAngle += layer.angleStep;
                }
                break;
            case 40 : //down
                if ( layer.jointAngle > -135.0 ) {
                    layer.jointAngle -= layer.angleStep;
                }
                break;
            case 37 : //left
                layer.armAngle = (layer.armAngle - layer.angleStep) % 360;
                break;
            case 39 : //right
                layer.armAngle = (layer.armAngle + layer.angleStep) % 360;
                break;
            default : return;
        }
        drawLayer(gl, mvpMat, layer, n);
    }
}

// 画图
function draw (gl, n) {
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

// 画层次模型
function drawLayer (gl, mvpMat, layer, n) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //arm1
    mvpMat.model.setTranslate(0.0, -12.0, 0.0).rotate(layer.armAngle, 0.0, 1.0, 0.0);
    setMVPMatrix(gl, mvpMat);
    draw(gl, n);
    //arm2
    mvpMat.model.translate(0.0, layer.armLength, 0.0).rotate(layer.jointAngle, 0.0, 0.0, 1.0);
    mvpMat.model.scale(1.3, 1.0, 1.3);
    setMVPMatrix(gl, mvpMat);
    draw(gl, n);
}

ready(loadWEBGL);