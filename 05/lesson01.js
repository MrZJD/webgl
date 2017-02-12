////Chapter 5
//Temp 01

//多个数据的缓冲区

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
	gl_Position = a_Position;
    gl_PointSize = a_PointSize;
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
    var a_PointSize = webgl.getAttribLocation(webgl.program, 'a_PointSize');
	if ( a_Position < 0  || a_PointSize < 0 ) {
		console.error('Failed to get the storage attribute location!');
		return ;
	}

    // 获取绘制点的个数
	var p_Counts = initBuffer(webgl, a_Position, a_PointSize);
	if ( p_Counts < 0 ) {
		console.error('Failed to init buffer!');
		return ;
	}

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);

    webgl.clear(webgl.COLOR_BUFFER_BIT);
	webgl.drawArrays(webgl.POINTS, 0, p_Counts);
});

// 返回绘制点的个数
// -1 则报错
function initBuffer (webgl, a_Position, a_PointSize) {
	// 顶点数据
	var points = new Float32Array([0, 0.5, 2.0, -0.5, -0.5, 5.0, 0.5, -0.5, 10.0]);
	var n = points.length/3;
    var FSIZE = points.BYTES_PER_ELEMENT;

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
	webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, FSIZE*3, 0);
    webgl.vertexAttribPointer(a_PointSize, 1, webgl.FLOAT, false, FSIZE*3, FSIZE*2);
	// 启用attribute变量 => 即链接缓冲区到attribute变量上
	webgl.enableVertexAttribArray(a_Position);
    webgl.enableVertexAttribArray(a_PointSize);

	return n;
}