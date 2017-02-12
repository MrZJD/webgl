//Chapter 2
//Temp 01

//绘制颜色

ready(() => {
	var canvas = document.getElementById('webgl');

	if ( !canvas ) {
		console.error('Failed to retrieve the <canvas> element!');
		return ;
	}

	// var webgl = canvas.getContext('2d');
	// var webgl = canvas.getContext('experimental-webgl');
	var  webgl = canvas.getContext('webgl'); //标准还未实施

	webgl.clearColor(0, 0, 1, 0.5);
	webgl.clear(webgl.COLOR_BUFFER_BIT);
});