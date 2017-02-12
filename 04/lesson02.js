//Chapter 4
//Temp 02

//动画初步

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
uniform mat4 u_xformMatrix; //变化矩阵
void main() {
	// 注意矩阵乘法的先后顺序
	gl_Position = u_xformMatrix * a_Position;
}`;

// 片元着色器程序
var FSHADER_SOURCE = 
`void main() {
	gl_FragColor = vec4(1.0, 0, 0, 1.0);
}`;

ready(() => {
	var canvas = document.getElementById('webgl');
	if ( !canvas ) {
		console.error('Failed to retrieve the <canvas> element!');
		return ;
	}

	var webgl = canvas.getContext('webgl');
	if ( !initShaders( webgl, VSHADER_SOURCE, FSHADER_SOURCE) ) {
		console.error('Failed to initialize shaders!');
	}

	// 获取attribute变量的地址
	var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
	if ( a_Position < 0 ) {
		console.error('Failed to get the storage attribute location!');
		return ;
	}

    // 获取绘制点的个数
	var p_Counts = initBuffer(webgl, a_Position);
	if ( p_Counts < 0 ) {
		console.error('Failed to init buffer!');
		return ;
	}

    // 获取uniform变量的地址
	var u_xformMatrix = webgl.getUniformLocation( webgl.program, 'u_xformMatrix');
	if ( !u_xformMatrix ) {
		console.error('Failed to get the uniform location!');
		return ;
    }

	// 旋转变换矩阵
	var tAngle = 90;//角度制

    var matrix = new Matrix4();

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);

    // matrix.setRotate(tAngle, 0, 0, 1);
    // draw( webgl, u_xformMatrix, matrix, p_Counts);
    var currAngle = 0;
    var tick = function () {
        currAngle = animate(currAngle);
        matrix.setRotate(currAngle, 0, 0, 1);
        draw(webgl, u_xformMatrix, matrix, p_Counts);
        requestAnimationFrame(tick);
    }
    tick();
});

// 返回绘制点的个数
// -1 则报错
function initBuffer (webgl, a_Position) {
	// 顶点数据
	var points = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
	var n = points.length/2;

	// buffer对象
	var vertexBuffer = webgl.createBuffer();
	if ( !vertexBuffer ) {
		console.error('Failed to create buffer!');
		return -1;
	}

	// 绑定对象到缓冲区指针(顶点数据)上
	webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
	// 写入数据到缓冲区
	webgl.bufferData(webgl.ARRAY_BUFFER, points, webgl.STATIC_DRAW);
	// 指定attribute变量解析规则
	webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0, 0);
	// 启用attribute变量 => 即链接缓冲区到attribute变量上
	webgl.enableVertexAttribArray(a_Position);

	return n;
}

// 绘制
function draw (webgl, u_matrix, matrix, pCounts) {
    webgl.uniformMatrix4fv(u_matrix, false, matrix.elements);
    // 绘制
    webgl.clear(webgl.COLOR_BUFFER_BIT);
	webgl.drawArrays(webgl.TRIANGLES, 0, pCounts);
}

// 动画函数
// 计算下一帧的变化角度
// return angle值
var TIMESTAMP = Date.now();
var STEP = 45 // 45度/s
function animate (angle) {
    var now = Date.now();
    var time_temp = Date.now() - TIMESTAMP; //两帧之间时间差
    TIMESTAMP = now;

    var newAngle = angle + (time_temp * STEP) / 1000;
    return newAngle;
}