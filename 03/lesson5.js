//Chapter 3
//Temp 05

//旋转变化

// 顶点着色器程序
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
uniform float u_CosB, u_SinB;//变换量
void main() {
	//旋转变换方式
	gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
	gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
	gl_Position.z = a_Position.z;
	gl_Position.w = 1.0;
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

	// 获取uniform变量的地址
	var u_CosB = webgl.getUniformLocation(webgl.program, 'u_CosB');
	var u_SinB = webgl.getUniformLocation(webgl.program, 'u_SinB');
	if ( !u_SinB || !u_CosB ) {
		console.error('Failed to get the storage uniform location!');
		return ;
	}

	//计算变换值
	var tAngle = 90;//角度制
	var tRadian = tAngle * Math.PI / 180;//弧度制

	// 设置uniform变量的值
	webgl.uniform1f(u_SinB, Math.sin(tRadian));
	webgl.uniform1f(u_CosB, Math.cos(tRadian));

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
	webgl.drawArrays(webgl.TRIANGLES, 0, p_Counts);
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