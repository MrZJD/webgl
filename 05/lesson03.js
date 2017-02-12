////Chapter 5
//Temp 03

//从逐顶点 => 光栅化 => 逐片元

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
void main() {
	gl_Position = a_Position;
}`;

// 片元着色器程序
var FSHADER_SOURCE = 
`precision mediump float;
uniform float u_Width;
uniform float u_Height;
void main() {
    //证明片元着色器是逐像素被调用的
	gl_FragColor = vec4(gl_FragCoord.x / u_Width, 0.0, gl_FragCoord.y / u_Height, 1.0);
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

    var u_Width = webgl.getUniformLocation(webgl.program, 'u_Width');
    var u_Height = webgl.getUniformLocation(webgl.program, 'u_Height');
    if ( !u_Width || !u_Height ) {
        console.error('Failed to get the uniform location!');
        return ;
    }
    webgl.uniform1f(u_Width, 400.0);
    webgl.uniform1f(u_Height, 400.0);

    // 获取绘制点的个数
	var p_Counts = initBuffer(webgl, a_Position);
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