////Chapter 5
//Temp 02

//varying变量

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
void main() {
	gl_Position = a_Position;
    // gl_PointSize = 10.0;
    v_Color = a_Color;
}`;

// 片元着色器程序
var FSHADER_SOURCE = 
`precision mediump float;
varying vec4 v_Color;
void main() {
	gl_FragColor = v_Color;
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
		return ;
	}

	// 获取attribute变量的地址
	var a_Position = webgl.getAttribLocation(webgl.program, 'a_Position');
    var a_Color = webgl.getAttribLocation(webgl.program, 'a_Color');
	if ( a_Position < 0  || a_Color < 0 ) {
		console.error('Failed to get the storage attribute location!');
		return ;
	}

    // 获取绘制点的个数
	var p_Counts = initBuffer(webgl, a_Position, a_Color);
	if ( p_Counts < 0 ) {
		console.error('Failed to init buffer!');
		return ;
	}

	// 清空颜色缓冲区
	webgl.clearColor(0, 0, 0, 0.6);

    webgl.clear(webgl.COLOR_BUFFER_BIT);
	// webgl.drawArrays(webgl.POINTS, 0, p_Counts);    
	webgl.drawArrays(webgl.TRIANGLES, 0, p_Counts);
});

// 返回绘制点的个数
// -1 则报错
function initBuffer (webgl, a_Position, a_Color) {
	// 顶点数据
	var points = new Float32Array([0, 0.5, 1.0, 0.0, 0.0,
                                  -0.5, -0.5, 0.0, 1.0, 0.0,
                                   0.5, -0.5, 0.0, 0.0, 1.0]);
	var n = points.length/5;
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
	webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, FSIZE*5, 0);
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE*5, FSIZE*2);
	// 启用attribute变量 => 即链接缓冲区到attribute变量上
	webgl.enableVertexAttribArray(a_Position);
    webgl.enableVertexAttribArray(a_Color);

	return n;
}