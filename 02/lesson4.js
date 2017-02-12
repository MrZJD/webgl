//Chapter 2
//Temp 04

//绘制一个点
// 使用uniform变量

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position; //声明attribute变量
attribute float a_PointSize;// 限定符 数据类型 变量名
void main() {
	gl_Position = a_Position;
	gl_PointSize = a_PointSize;
}`;

// 片元着色器程序
var FSHADER_SOURCE = 
`precision mediump float;// 精度限定 详细见第五章
uniform vec4 u_FragColor;
void main() {
	gl_FragColor = u_FragColor;
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
	var a_PointSize = webgl.getAttribLocation(webgl.program, 'a_PointSize');
	if ( a_Position < 0 || a_PointSize < 0) {
		console.error('Failed to get the storage attribute location!');
		return ;
	}

	// 获取uniform变量的地址
	var u_FragColor = webgl.getUniformLocation(webgl.program, 'u_FragColor');
	if ( !u_FragColor ) {
		console.error('Failed to get the storage uniform location!');
		return ;
	}

	// 根据地址给attribute变量赋值
	webgl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0);
	webgl.vertexAttrib1f(a_PointSize, 10.0);

	// 根据地址给uniform变量赋值
	webgl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);
	webgl.clear(webgl.COLOR_BUFFER_BIT);

	// 画点
	webgl.drawArrays(webgl.POINTS, 0, 1);
});