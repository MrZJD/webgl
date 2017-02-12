//Chapter 2
//Temp 02

//绘制一个点
// 接触着色器语法

// 顶点着色器程序
var VSHADER_SOURCE = 
`void main() {
	gl_Position = vec4(0.5, 0.5, 0, 1);
	gl_PointSize = 10.0;
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

	var  webgl = canvas.getContext('webgl'); //标准还未实施

	//初始化着色器
	if ( !initShaders( webgl, VSHADER_SOURCE, FSHADER_SOURCE) ) {
		console.error('Failed to initialize shaders!');
	}

	webgl.clearColor(0, 0, 0, 0.6);
	webgl.clear(webgl.COLOR_BUFFER_BIT);

	//画点
	webgl.drawArrays(webgl.POINTS, 0, 1);
});