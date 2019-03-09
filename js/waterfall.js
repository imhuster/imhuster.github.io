/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * 内容JSON
     */
  var demoContent = [
    {
      demo_link: 'https://github.com/imhuster/DynamicProxy',
      //img_link: 'https://ooo.0o0.ooo/2016/11/24/5836d81f48cd2.png',
      code_link: 'https://github.com/imhuster/DynamicProxy',
      title: '基于反射加动态编译实现的增强版动态代理框架',
      core_tech: 'Java',
      description: '反射加动态编译实现的增强版动态代理，支持 final 无接口类，核心代码300行。算法详情见 <a href ="https://github.com/imhuster/DynamicProxy">这里</a>。'
    }
  ];

  contentInit(demoContent) //内容初始化
  waitImgsLoad() //等待图片加载，并执行布局初始化
}());

/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
  // var htmlArr = [];
  // for (var i = 0; i < content.length; i++) {
  //     htmlArr.push('<div class="grid-item">')
  //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
  //     htmlArr.push('<img src="'+content[i].img_link+'">')
  //     htmlArr.push('</a>')
  //     htmlArr.push('<h3 class="demo-title">')
  //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
  //     htmlArr.push('</h3>')
  //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
  //     htmlArr.push('<p>'+content[i].description)
  //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
  //     htmlArr.push('</p>')
  //     htmlArr.push('</div>')
  // }
  // var htmlStr = htmlArr.join('')
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' ;
	if(content[i].demo_link && content[i].img_link){
		htmlStr += '   <a class="a-img" href="' + content[i].demo_link + '">' ;
		htmlStr += '       <img src="' + content[i].img_link + '">' ;
		htmlStr += '   </a>' ;
	}
	if(content[i].demo_link && content[i].img_link){
			htmlStr += '   <h3 class="demo-title">' ;
			htmlStr += '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' ;
			htmlStr += '   </h3>' ;
	}
	if(content[i].core_tech){
			htmlStr += '   <p>主要技术：' + content[i].core_tech + '</p>' ;
	}
	if(content[i].description){
			htmlStr += '   <p>' + content[i].description ;
			if(content[i].code_link){
				htmlStr += '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' ;
			}
			htmlStr += '   </p>' ;
			htmlStr += '</div>';
	}
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    //console.log('---bbbbbbbb')
    initGrid()
  }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
