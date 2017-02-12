//Chapter 07
//Temp 05

//监听键盘事件对盒状可视范围的变化

//vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix; //视图矩阵
    uniform mat4 u_ProjMatrix; //盒状可视范围
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;
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

    var ex = -0.25, ey = 0.00, ez = 0.30;
    var near = 0.0, far = 2.0;
    var setView = setViewMatrix(webgl, ex, ey, ez);
    var setProj = setProjMatrix(webgl, near, far);
    var update = updateHtml(near, far, ex, ey, ez);
    document.onkeydown = function (evt) {
        console.log(evt.keyCode);
        switch ( evt.keyCode ) {
            case 39: near += 0.01; break; //right
            case 37: near -= 0.01; break; //left
            case 38: far += 0.01; break; //up
            case 40: far -= 0.01; break; //down
            case 65: ex -= 0.01; break; //a
            case 68: ex += 0.01; break; //d
            case 87: ey += 0.01; break; //w
            case 83: ey -= 0.01; break; //s
            case 81: ez += 0.01; break; //q
            case 69: ez -= 0.01; break; //e
            default: return;
        }
        setView(ex, ey, ez);
        // setProj(near, far);
        update(near, far, ex, ey, ez);
        draw(webgl, n);
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
function setProjMatrix (webgl, near, far) {
    var u_ProjMatrix = webgl.getUniformLocation(webgl.program, 'u_ProjMatrix');
    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-1, 1, -1, 1, near, far);
    webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    return (near, far) => {
        projMatrix.setOrtho(-1, 1, -1, 1, near, far);
        webgl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    };
}

// 设置视图矩阵
function setViewMatrix (webgl, ex, ey, ez) {
    var u_ViewMatrix = webgl.getUniformLocation(webgl.program, 'u_ViewMatrix');
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(ex, ey, ez, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    webgl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    return (ex, ey, ez) => { 
        viewMatrix.setLookAt(ex, ey, ez, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        webgl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    };
}

function draw (webgl, n) {
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES, 0, n);
}

// 设置innerhtml值
function updateHtml (near, far, x, y, z) {
    var nearBox = document.getElementById('near');
    var farBox = document.getElementById('far');
    var exBox = document.getElementById('ex');
    var eyBox = document.getElementById('ey');
    var ezBox = document.getElementById('ez');
    nearBox.innerText = near;
    farBox.innerText = far;
    exBox.innerText = x;
    eyBox.innerText = y;
    ezBox.innerText = z;
    return (near, far, ex, ey, ez) => {
        nearBox.innerText = Math.round(near*100)/100;
        farBox.innerText = Math.round(far*100)/100;
        exBox.innerText = ex;
        eyBox.innerText = ey;
        ezBox.innerText = ez;
    }
}