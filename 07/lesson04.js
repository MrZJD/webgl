//Chapter 07
//Temp 04

//监听键盘事件对盒状可视范围的变化

//vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix; //盒状可视范围
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ProjMatrix * a_Position;
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

    var ex = -0.25, ey = 0.10, ez = 0.30;
    var near = 0, far = 0.5;
    var setProj = setProjMatrix(webgl);
    var update = updateHtml(near, far);
    document.onkeydown = function (evt) {
        switch ( evt.keyCode ) {
            case 39: near += 0.01; break; //右
            case 37: near -= 0.01; break; //左
            case 38: far += 0.01; break; //up
            case 40: far -= 0.01; break; //down
            default: return;
        }
        setProj(near, far, n);
        update(near, far);
    };

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

// 设置盒装可视范围矩阵
function setProjMatrix (webgl) {
    var u_ProjMatrix = webgl.getUniformLocation(webgl.program, 'u_ProjMatrix');
    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-1, 1, -1, 1, 0, 0.5);
    webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    return (near, far, n) => {
        projMatrix.setOrtho(-1, 1, -1, 1, near, far);
        webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
        webgl.clear(webgl.COLOR_BUFFER_BIT);
        webgl.drawArrays(webgl.TRIANGLES, 0, n);
    };
}

// 设置innerhtml值
function updateHtml (near, far) {
    var nearBox = document.getElementById('near');
    var farBox = document.getElementById('far');
    nearBox.innerText = near;
    farBox.innerText = far;
    return (near, far) => {
        nearBox.innerText = Math.round(near*100)/100;
        farBox.innerText = Math.round(far*100)/100;
    }
}