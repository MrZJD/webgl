//Chapter 3
//Temp 03

//绘制多种基本图形

//webgl.LINES
//webgl.LINE_STRIP
//webgl.LINE_LOOP
//webgl.TRIANGLE_STRIP
//webgl.TRIANGLE_FAN

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position; //声明attribute变量
// attribute float a_PointSize;// 限定符 数据类型 变量名
void main() {
	gl_Position = a_Position;
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

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);
	webgl.clear(webgl.COLOR_BUFFER_BIT);

	// 绘制
	// webgl.drawArrays(webgl.TRIANGLES, 0, p_Counts);
	// webgl.drawArrays(webgl.LINES, 0, p_Counts);
	// webgl.drawArrays(webgl.LINE_STRIP, 0, p_Counts);
	// webgl.drawArrays(webgl.LINE_LOOP, 0, p_Counts);
	webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, p_Counts);
	// webgl.drawArrays(webgl.TRIANGLE_FAN, 0, p_Counts);
});

// 返回绘制点的个数
// -1 则报错
function initBuffer (webgl, a_Position) {
	// 顶点数据
	var points = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]);
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