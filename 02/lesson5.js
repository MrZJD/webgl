//Chapter 2
//Temp 05

//绘制一个点
// 绑定事件

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position; //声明attribute变量
// attribute float a_PointSize;// 限定符 数据类型 变量名
void main() {
	gl_Position = a_Position;
	gl_PointSize = 10.0;
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

	// canvas绑定事件
	canvas.onmousedown = function (evt) {
		click(evt, canvas, webgl, a_Position, u_FragColor);
	};

	// 获取attribute变量的地址
	var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
	if ( a_Position < 0 ) {
		console.error('Failed to get the storage attribute location!');
		return ;
	}

	// 获取uniform变量的地址
	var u_FragColor = webgl.getUniformLocation(webgl.program, 'u_FragColor');
	if ( !u_FragColor ) {
		console.error('Failed to get the storage uniform location!');
		return ;
	}

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);
	webgl.clear(webgl.COLOR_BUFFER_BIT);
});

var points = [];
var colors = [];
var click = function (evt, canvas, webgl, pLocation, fLocation) {
	var x = evt.clientX;
	var y = evt.clientY;
	var rect = evt.target.getBoundingClientRect();

	x = (x - rect.left)/(canvas.width/2) - 1;
	y = 1 - (y - rect.top)/(canvas.height/2);
	points.push([x, y]);

	if ( x>0 && y>0 ) {
		colors.push([1.0, 0.0, 0.0, 1.0]);
	} else if ( x<0 && y<0) {
		colors.push([0.0, 0.0, 1.0, 1.0]);
	} else {
		colors.push([1.0, 1.0, 1.0, 1.0]);
	}

	// 绘制前先用指定颜色清空缓冲区
	// 否则默认clear() 黑色全透明背景色
	webgl.clear(webgl.COLOR_BUFFER_BIT);

	for (var i=points.length; i>0; i--) {
		var xy = points[i-1];
		var rgba = colors[i-1];

		webgl.vertexAttrib3f(pLocation, xy[0], xy[1], 0.0);
		webgl.uniform4f(fLocation, rgba[0], rgba[1], rgba[2], rgba[3]);
		webgl.drawArrays(webgl.POINTS, 0, 1);
	}
};