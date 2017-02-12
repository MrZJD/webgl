//Chapter 2
//Temp 03

//绘制一个点
// 使用attribute传值

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
`void main() {
	gl_FragColor = vec4(1, 0, 0, 1);
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
		console.error('Failed to get the storage location!');
		return ;
	}

	// 根据地址给attribute变量赋值
	webgl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0);
	webgl.vertexAttrib1f(a_PointSize, 10.0);

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);
	webgl.clear(webgl.COLOR_BUFFER_BIT);

	// 画点
	webgl.drawArrays(webgl.POINTS, 0, 1);
});