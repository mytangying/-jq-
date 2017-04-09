// 把整个函数放在闭包中防止污染全局作用域
// 形参window是为了以后压缩方便，可以改为w或者其他简单的字母
// undefined是历史遗留问题，之前低版本浏览器不支持undefined关键字
(function(window, undefined) {
    // 兼容ie低版本中push.apply的第二个参数不能为伪数组
    var arr = [],
        push = arr.push,
        slice = arr.slice;
    try {
        var div = document.createElement("div");
        div.innerHTML = "<p>p</p>";
        var arr = [];
        push.apply(arr, div.getElementsByTagName("p"));
    } catch (e) {
        push = {
            //将参数2中的元素加到参数1中
            apply: function(arr1, arr2) {
                for (var i = 0; i < arr2.length; i++) {
                    arr1[arr1.length++] = arr2[i];
                }
            }
        }
    }

    // 入口函数 所有沙箱都是从这里开始
    function ty(html) {
        // 创建init的实例对象
        return new ty.fn.init(html);
    }
    // 原型对象
    ty.fn = ty.prototype = {
            constructor: ty,
            length: 0,
            // 如果一个对象的属性type值为ty则该对象为ty实例对象
            type: "ty",
            // 用来保存选择器字符串
            selector: "",
            // 核心函数，创建实例对象的构造函数
            init: function(html) {
                //给实例对象添加一个events属性，该属性初始化为一个空对象，
                // 用来存储事件名称，键为事件名称，值为事件出发时执行的函数，值的类型为数组
                // eg：this.events={"click":[function(e){},function(e){}],"mouseover":[function(e){}]}
                this.events = {};
                // 如果参数为空或空字符串则直接返回空的init实例对象
                if (html === "" || html == null) {
                    return;
                }
                // 如果参数为字符串类型则分为两种：DOM元素类型字符串，选择器类型字符串
                if (ty.isString(html)) {
                    // 如果以<开头则为DOM元素类型字符串，调用parseHTML函数并且将结果追加到init实例对象中，得到一个伪数组
                    if (/^</.test(html)) {
                        push.apply(this, parseHTML(html));
                    } else {
                        // 否则为选择器类型的字符串，调用ty.select方法找到对应的元素并将结果追加到init实例对象中
                        push.apply(this, ty.select(html));
                        // 将选择器字符串保存到selector属性中
                        this.selector = html;
                    }
                }
                // 如果参数为函数则做页面加载的处理
                if (ty.isFunction(html)) {
                    // 将window.onload事件处理的内容存储到变量oldFn中，onload=window.onload
                    var oldFn = onload;
                    // 如果oldFn的类型是一个函数则证明window.onload有对应的事件处理函数
                    if (typeof oldFn == "function") {
                        // 为onload事件绑定一个匿名的事件处理函数
                        onload = function() {
                            // 执行调用之前绑定的onload事件处理函数
                            oldFn();
                            // 再调用新传递的事件处理函数
                            html();
                        }
                    } else {
                        // 如果oldFn不是一个函数则证明window.onload没有做事件处理函数
                        onload = html;
                    }
                }
                // 如果参数为ty创建的实例对象，则创建一个新的ty实例对象，这个实例对象的数据跟html对象数据一致
                if (html && html.type == "ty") {
                    // 将html对象保存的元素添加到新创建的实例对象中
                    push.apply(this, html);
                    // 赋值selector属性
                    this.selector = html.selector;
                }
                // 如果参数为一个DOM元素，则其具有nodeType属性
                if (html && html.nodeType) {
                    this[0] = html;
                    // 当我们对ty实例对象去设置0下标的元素时，
                    // 只是将0下标的元素设置了dom对象，
                    // 并不会改变length属性，所以我们需要手动的添加一句
                    this.length = 1;
                }
            }
        }
        //让构造函数的原型对象与ty函数的原型对象一致
        //此时ty函数的原型中的方法，构造函数的原型中也会拥有
        //那么实例对象也就能继承原型中的这些方法了。例如appendTo方法
    ty.fn.init.prototype = ty.fn;

    //为ty函数及其原型对象添加扩展方法
    ty.extend = ty.fn.extend = function(obj) {
            for (var k in obj) {
                this[k] = obj[k];
            }
        }
        // 调用ty的extend方法添加静态方法,工具方法
    ty.extend({
        //验证是否为字符串类型
        isString: function(data) {
            return typeof data === "string";
        },
        isFunction: function(data) {
            return typeof data === "function";
        },
        isObject: function(data) {
            return typeof data === "object";
        },
        getStyle: function(elements, attr) {
            if (elements.currentStyle) {
                return elements.currentStyle[attr];
            } else {
                return window.getComputedStyle(elements)[attr];
            }
        }
    });


    //静态方法
    ty.extend({
        //each方法，遍历，无返回值
        each: function(array, callback) {
            // 若第一个参数为数组或者伪数组
            if (array instanceof Array || array.length >= 0) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(array[i], i, array[i]);
                }
            } else {
                // 若第一个参数为对象
                for (var i in array) {
                    callback.call(array[i], i, array[i]);
                }
            }
        },
        //map映射，返回值为数组
        map: function(array, callback) {
            var res = [],
                temp;
            if (array instanceof Array || array.length >= 0) {
                for (var i = 0; i < array.length; i++) {
                    temp = callback(array[i], i);
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            } else {
                for (var i in array) {
                    temp = callback(array[i], i);
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            }
            return res;
        }
    });


    // 调用ty.fn的extend方法添加实例方法
    ty.fn.extend({
        //将this添加到selector中
        appendTo: function(selector) {
            //将参数转化为ty对象类型，selector可能为：选择器字符串，dom类型字符串，ty对象，dom元素
            var iObj = this.constructor(selector);
            // 创建一个空对象，用来存储所有的本体元素和克隆元素
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var dom;
                    // 如果j循环是最后一次的话，就添加本体元素
                    if (j == iObj.length - 1) {
                        dom = this[i];
                    } else {
                        // 否则添加克隆体元素
                        dom = this[i].cloneNode(true);
                    }
                    // 将dom添加到newObj对象中
                    push.call(newObj, dom);
                    // 将dom添加到iObj对象中的第j个元素中
                    iObj[j].appendChild(dom);
                }
            }
            //经过循环以后，newObj中包含了所有的本体，复制体元素，所以将newObj返回支持链式编程
            return newObj;
        },
        // 将selector添加到this中
        append: function(selector) {
            //将参数转化为ty对象的元素，添加到this对象中
            this.constructor(selector).appendTo(this);
            return this;
        },
        // 将this添加到selector中的最前面
        prependTo: function(selector) {
            var iObj = this.constructor(selector);
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var dom;
                    if (j == iObj.length - 1) {
                        dom = this[i];
                    } else {
                        dom = this[i].cloneNode(true);
                    }
                    // 将dom添加到iObj对象中的第j个元素中的最前面
                    iObj[j].insertBefore(dom, iObj[j].firstChild);
                    [].push.call(newObj, dom);
                }
            }
            return newObj;
        },
        // 将selector添加到this中的最前面
        prepend: function(selector) {
            this.constructor(selector).prependTo(this);
            return this;
        }
    });


    // 添加核心方法功能模块
    ty.fn.extend({
        //转化为数组
        toArray: function() {
            // for (var i = 0; i < this.length; i++) {
            //     res.push(this[i]);
            // }
            // console.log(this);
            return slice.call(this, 0);
        },
        //get方法获取索引值为index的值，若为undefined则获取全部
        get: function(index) {
            if (index === undefined) {
                return this.toArray();
            }
            return this[index];
        },
        //eq方法根据index下标返回一个ty对象，对象中包含下标对应的元素
        //如果下标不对则返回一个空的ty实例对象，如果下标为负数则从右向左查询
        eq: function(index) {
            var dom;
            if (index >= 0) {
                dom = this.get(index);
            } else {
                dom = this.get(this.length + index);
            }
            // 将dom元素包装成一个ty对象
            // return ty(dom);
            return this.constructor(dom);
            //为什么要写this.constructor来访问ty函数呢？
            /*跟语义化有关系，我们的代码是放在框架里面，如果说要访问ty函数
            就应该使用this.constructor.

            我们知道对外公开的接口名称是什么?是ty, I
            对于使用框架的客户，用户来说，如果要使用框架直接用ty()就可以了

            但是，在框架内部也使用ty()就不合适了，这样就无法区分我到底在什么地方调用的
            构造函数,

            所以在外部我们使用ty()调用框架，在框架内部使用this.constructor()
            */
        },
        each: function(callback) {
            ty.each(this, callback);
            return this;
        },
        map: function(callback) {
            return ty.map(this, callback);
        }
    });

    // 添加事件处理方法模块
    ty.fn.extend({
        //直接绑定on方法
        //1.假如有人调用了click方法，意思就是需要做事件处理函数的绑定
        //func函数就应该是点击的时候要触发的函数，但是click方法可能会调用多次
        //那么func函数可能会有多个，那么我们就应该将这个多个处理函数
        //添加到events属性中的click数组中。
        // eg：this.events={"click":[function(e){},function(e){}]}
        //2.是不是每一个ty对象都有能要做事件处理，每一个ty对象都应该有events属性
        //3.当click内部代码被执行的时候，我们应该要有一个click数组来存放处理函数
        on: function(type, func) {
            // 如果实例对象的events属性值中没有click这个属性则初始为一个空数组
            if (!this.events[type]) {
                this.events[type] = [];
                // 例如给ty实例对象注册click事件，其中的每一个dom元素都要注册此事件，
                // 并且此事件可能有多个执行函数，则其中一个dom元素触发click事件时所有的函数都会被执行
                // 此处this指实例对象
                var iObj = this;
                // 遍历每一个dom元素给其注册事件
                iObj.each(function() {
                    var f = function(e) {
                            // 遍历实例对象的events属性中的type属性中的每一个函数，
                            // 当点击某一dom元素时依次执行type属性中的所有函数
                            for (var i = 0; i < iObj.events[type].length; i++) {
                                // 方法调用：iObj.events[type]调用iObj.events[type][i]方法
                                // eg：iObj.events["click"]=[function(e){alert(1)},function(e){}]调用了function(e){alert(1)}
                                //所以在触发click事件时，this指向[function(e){alert(1)},function(e){}];
                                // 因此采用借调方式，改变this指向，让this指向触发此事件的dom元素
                                iObj.events[type][i].call(this, e);
                            }
                        }
                        //将函数f绑定给元素的函数处理
                        //实际上应该有一个support对象来保存方法定义检测的结果，减少原型链的搜索
                    if (/\{\s*\[native/.test(this.addEventListener)) {
                        this.addEventListener(type, f);
                    } else {
                        this.attachEvent("on" + type, f);
                    }

                    //     //也可以使用直接赋值。
                    //     // this指ty对象中的每一个dom元素
                    // this["on" + type] = f;
                });
            }
            //如果实例对象的events属性值中有type这个属性,则直接给该属性添加值，该值为一个函数
            // 并且此事件可能有多个执行函数，需要将所有的执行函数都添加到this.events[type]的属性值中，这些函数组成一个数组
            this.events[type].push(func);
            //将this返回是为了链式编程
            return this;
        },
        // 解绑事件
        off: function(type, func) {
            //使用arr变量保存type数组的引用
            var arr = this.events[type];
            //遍历arr数组，从后向前遍历，这样可以保证删除的时候不会跳过相同的元素
            for (var i = arr.length - 1; i >= 0; i--) {
                // 找到func函数并将其删除
                if (arr[i] == func) {
                    //将数组中i下标的元素删除
                    arr.splice(i, 1);
                }
            }
            //将this返回是为了链式编程
            return this;
        },
        // 鼠标经过
        hover: function(func1, func2) {
            return this.on("mouseover", func1).on("mouseout", func2);
        },
        // 点击切换
        toggle: function() {
            var i = 0;
            var args = arguments;
            this.on("click", function(e) {
                //如果没有借调，arguments调用此函数，所以用this借调，此处this指向实例对象中的每一个dom元素
                args[i % args.length].call(this, e);
                i++;
            });
            return this;
        }
    });
    //获取事件名称构成的数组
    var eventName = "mousemove mouseup mouseover mouseout mousedown click".split(" ");
    // 调用ty静态方法each遍历事件名称构成的数组
    ty.each(eventName, function(i, v) {
        // 给ty原型添加eventName数组中的方法
        ty.fn[v] = function(func) {
            // this指ty实例对象
            this.on(v, func);
            //将this返回是为了链式编程
            return this;
        }
    });


    // 样式操作模块
    ty.fn.extend({
        //css设置样式的形式
        // I("div").css("color");
        // I("div").css("color","red");
        // I("div").css({"color":"red","width":"200px"});
        css: function(option) {
            // 将实参赋值给变量args
            var args = arguments;
            // 实参的个数赋值给变量len
            var len = args.length;
            // 如果实参个数为2，并且参数是字符串类型则直接设置样式，
            // 第一个参数为属性名，第二个参数为属性值
            // I("div").css("color","red");
            if (len == 2) {
                if (ty.isString(args[0]) && ty.isString(args[1])) {
                    return this.each(function() {
                        this.style[args[0]] = args[1];
                    });
                }
            } else if (len == 1) {
                //如果只有一个实参，并且参数为字符串类型则获取该样式
                if (ty.isString(option)) {
                    // 获取option样式 I("div").css("color");
                    return this[0].style[option] || ty.getStyle(this[0], option);
                } else if (ty.isObject(option)) {
                    // 如果参数是一个对象类型则设置样式  I("div").css({"color":"red","width":"200px"});
                    return this.each(function() {
                        for (var k in option) {
                            this.style[k] = option[k];
                        }
                    });
                }
            }
            return this;
        },
        //添加类名
        addClass: function(className) {
            // this指调用该方法的ty实例对象
            return this.each(function() {
                // 如果存在类则添加直接在此基础上多添加一个类名
                if (this.className) {
                    // 如果本身有该类名则无需添加，没有则添加,this指每一个dom元素
                    if ((" " + this.className + " ").indexOf(" " + className + " ") == -1) {
                        this.className += " " + className;
                    }
                } else {
                    如果不存在类则添加类
                    this.className = className;
                }
            });
        },
        //删除类名
        removeClass: function(className) {
            return this.each(function() {
                // if (this.className) {
                    // var arr = (this.className).split(/\s+/);
                    // for (var i = arr.length - 1; i >= 0; i--) {
                    //     if (arr[i] == className) {
                    //         arr.splice(i, 1);
                    //     }
                    // }
                    // this.className = arr.join(" ");

                // }

                var classTxt = " " + this.className + " ";
                var rname = new RegExp(" " + className + " ", "g");
                this.className = classTxt.replace(rname, " ").replace(/\s+/g, " ").trim();
            })
        },
        hasClass: function(className) {
            for (var i = 0; i < this.length; i++) {
                if ((" " + this[i].className + " ").indexOf(" " + className + " ") != -1) {
                    return true;
                }
            }
             return false;
        },
        toggleClass:function(className){
            if(this.hasClass(className)){
                this.removeClass(className);
            }else{
                this.addClass(className);
            }
            return this;
        }

    });


    // 属性操作模块
    ty.fn.extend({
        attr:function(name,value){
            if(value||value==""){
                //如果value值存在或者值为空字符串并且两个参数都是字符串类型时则设置属性样式
                if(ty.isString(name)&&ty.isString(value)){
                    // 此时this是指ty实例对象，遍历
                    this.each(function(){
                        // 此时this指实例对象中的每一个dom元素，为每一个dom元素设置属性样式
                        this.setAttribute(name, value);
                    });
                }
            }else{
                // 如果只有一个参数，该参数是一个字符串则获取该属性并返回
                if(ty.isString(name)){
                   return  this[0].getAttribute(name);
                }
            }
            // 当没有返回获取的属性时返回实例对象，用于链式编程
            return this;
        },
        prop:function(name,value){
            if(value||value==""){
                // 第二个参数可以不是字符串类型
                if(ty.isString(name)){
                    this.each(function(){
                        this[name]=value;
                    });
                }
            }else{
                if(ty.isString(name)){
                    return this[0][name];
                }
            }
            return this;
        },
        val:function(v){
            //调用ty.fn的attr方法，第一个参数为value属性，第二个参数为value属性的值
            return this.attr("value",v);
        },
        html:function(html){
            return this.prop("innerHTML",html);
        },
        text:function(txt){
            if(txt||txt==""){
                //如果传入内容则直接插入，仍然要保持链式编程
                return this.each(function(){
                    // 将dom元素中原本的内容清空
                    this.innerHTML="";
                    //给dom元素添加文本节点
                    this.appendChild(document.createTextNode(txt+""));
                });
            }else{
                // 没有传入内容时获取内容
                // 遍历节点的子节点，如果子节点为文本节点则获取其内容追加到数组中
                // 如果子节点为元素节点则用递归函数，找到其子节点。。。。
                var arr=[];
                getTxt(this[0],arr);
                return arr.join(" ");

                function getTxt(node,list){
                    var childNodes=node.childNodes;
                    // 遍历节点的子节点
                    for (var i = 0; i < childNodes.length; i++) {
                        // 如果子节点为文本节点则获取其内容追加到数组中
                        if(childNodes[i].nodeType==3){
                            list.push(childNodes[i].nodeValue);
                        }
                        // 如果子节点为元素节点则用递归函数
                        if(childNodes[i].nodeType==1){
                            getTxt(childNodes[i],list);
                        }
                    }
                    return list;
                }
            }
        }

    });

    // 动画处理
    ty.Easing = {
        line: function(x, t, b, c, d) {
            var speed = (c - b) / d;
            return speed * t;
        },
        change: function(x, t, b, c, d) {
            return Math.log(t + 1) / Math.log(d + 1) * (c - b);
        },
        easeInQuad: function(x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function(x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function(x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function(x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function(x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function(x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function(x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function(x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function(x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function(x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function(x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function(x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }

    };

    ty.fn.extend({
        //定时器
        intervalId: null,
        // 动画处理
        animate: function(props, dur, easing, callback) {
            //将调用animate方法的ty实例对象保存到变量iObj中
            var iObj = this;
            // 开始属性
            var start = {};
            // 遍历实例对象，将其中的每一个dom元素的属性保存在start对象中
            this.each(function() {
                for (var k in props) {
                    start[k] = parseInt(ty.getStyle(this, k));
                }

            });
            // 开始时间
            var startTime = Date.now();
            // 动画速度
            easing = easing || "change";
            //判断动画是否结束
            var isOver = false;
            // 开启定时器，定时器内的this指向window，
            // 实例对象中的每一个dom元素的动画都相同所以开启同一个定时器即可
            iObj.intervalId = setInterval(function() {
                time = Date.now() - startTime;
                if (time >= dur) {
                    // 当达到时间时清除定时器
                    clearInterval(iObj.intervalId);
                    time = dur;
                    // 动画结束
                    isOver = true;
                }

                // 遍历ty实例对象，为其中的每一个dom元素设置最终属性
                iObj.each(function(i, v) {
                    for (var k in props) {
                        v.style[k] = start[k] + ty.Easing[easing](null, time, start[k], parseInt(props[k]), dur) + "px";
                    }
                });
                //如果动画结束并且回调函数存在则执行回调函数
                if (isOver && callback) {
                    callback();
                }
            }, 20);
            return this;
        },
        stop: function() {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("停止动画");
        }
    });







    // parseHTML函数，沙箱模式
    var parseHTML = (function() {
        //创建一个div，减少性能消耗
        var div = document.createElement("div");

        function parseHTML(html) {
            //将参数内容追加到div中变成DOM元素
            div.innerHTML = html;
            var res = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                //遍历div的子节点将其追加到res数组中
                res.push(div.childNodes[i]);
            }
            //将div中的内容清空，归位
            div.innerHTML = "";
            return res;
        }
        // 将parseHTML函数返回，此闭包外部可以调用该函数
        return parseHTML;
    })();

    //select函数，沙箱模式，防止污染全局作用域
    var select = (function() {
        // 正则表达式
        var rnative = /\{\s*\[native/;
        var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|([\w\-]+))$/;
        var rtrim = /^\s+|\s+$/g;
        // 浏览器方法检查-->方法定义检测
        var support = {};
        support.qsa = rnative.test(document.querySelectorAll + "");
        support.getElementsByClassName = rnative.test(document.getElementsByClassName + "");
        support.trim = rnative.test(String.prototype.trim + "");
        support.indexOf = rnative.test(Array.prototype.indexOf + "");
        // byClassName函数封装
        function byClassName(className, node, results) {
            node = node || document;
            results = results || [];
            if (support.getElementsByClassName) {
                push.apply(results, node.getElementsByClassName(className));
            } else {
                var list = node.getElementsByTagName("*");
                for (var i = 0; i < list.length; i++) {
                    if ((" " + list[i].className + " ").indexOf(" " + className + " ") != -1) {
                        results.push(list[i]);
                    }
                }
            }
            return results;
        }
        // myTrim函数封装
        function myTrim(str) {
            if (support.trim) {
                return str.trim();
            } else {
                return str.replace(rtrim, "");
            }
        }
        // myIndexOf函数封装
        function myIndexOf(array, search, startIndex) {
            startIndex = startIndex || 0;
            if (support.indexOf) {
                return array.indexOf(search, startIndex);
            } else {
                for (var i = startIndex; i < array.length; i++) {
                    if (array[i] == search) {
                        return i;
                    }
                }
            }
            // 如果没有找到匹配项则返回-1
            return -1;
        }
        // unique函数封装，去重
        function unique(array) {
            var res = [];
            for (var i = 0; i < array.length; i++) {
                // 遍历数组，将不重复的值追加到res中
                if (myIndexOf(res, array[i]) == -1) {
                    res.push(array[i]);
                }
            }
            return res;
        }
        // 基本选择器方法封装
        function basicSelect(selector, node) {
            node = node || document;
            //将匹配基本选择器正则表达式的选择器字符串赋值给m，
            var m;
            // 如果selector为基本选择器，则返回数组，如果不是则m返回null，将不会进入if判断
            if (m = rbaseselector.exec(selector)) {
                if (m[1]) {
                    //id选择器，通过getElementById方法返回一个res对象，如果id名不存在则返回null
                    var res = node.getElementById(m[1]);
                    if (res) {
                        // 如果res存在则将其放入数组中返回
                        return [res];
                    } else {
                        // 如果res不存在则返回空数组
                        return [];
                    }
                } else if (m[2]) {
                    // 类选择器
                    return getByClassName(m[2], node);
                } else {
                    //标签选择器或通配符*
                    return node.getElementsByTagName(selector);
                }
            } else {
                //如果不满足基本选择器的正则表达式则直接返回[]
                return [];
            }
        }

        //后代选择器
        function select2(selector, results) {
            results = results || [];
            //去除选择器字符串中的首尾空格
            selector = myTrim(selector);
            //按照空格分隔字符串为数组
            var nSelectors = selector.split(/\s+/);
            // 例如（"div p .c"）
            // 刚开始为node为document，第一次遍历node，从document中寻找所有的div标签追加到arr数组
            // 再将arr数组赋值给node，将arr数组归位为空数组，第二次遍历node，从每个div后代中寻找p标签追加到arr数组，
            // 再次将arr数组赋值给node，将arr数组归位为空数组，第三次遍历node，从每个p标签后代中寻找类名为c的标签追加到arr数组中

            //定义一个临时空数组，一个节点数组
            var arr = [],
                node = [document];
            // 遍历数组
            for (var i = 0; i < nSelectors.length; i++) {
                for (var j = 0; j < node.length; j++) {
                    // 刚开始从整个页面中寻找其后代元素中所有的nSelectors[1]标签，将其追加到arr数组中
                    push.apply(arr, basicSelect(nSelectors[i], node[j]));
                }
                // 将arr数组赋值给node，即下次从所有的nSelectors[1]标签后代中寻找nSelectors[2]标签
                node = arr;
                // 将arr数组归位为空数组
                arr = [];
            }
            // 遍历结束后满足条件的标签存在node中，将node追加到results结果数组中
            push.apply(results, node);
            // 将results数组去重并返回
            return unique(results);
        }

        // 基本选择器
        function select(selector, results) {
            results = results || [];
            //如果输入的选择器不是字符串类型则直接返回
            if (typeof selector != "string") return results;
            //如果系统有qsa方法则直接调用，否则自己实现
            if (support.qsa) {
                push.apply(results, document.querySelectorAll(selector));

            } else {
                // 自己实现算法
                // 根据逗号分隔选择器字符串
                var selectors = selector.split(",");
                // 遍历selectors数组
                for (var i = 0; i < selectors.length; i++) {
                    //去除选择器字符串中的首尾空格
                    subSelector = myTrim(selectors[i]);
                    //选择器字符串满足基本选择器正则,匹配成功代表subSelector就是一个基本选择器
                    if (rbaseselector.test(subSelector)) {
                        //调用基本选择器的方法获取选择器标签，追加到结果数组中
                        push.apply(results, basicSelect(subSelector));
                    } else {
                        // 匹配失败，认为是后代选择器字符串，使用select2函数查找后代选择器元素
                        select2(subSelector, results);
                    }
                }
            }
            // 将results数组去重并返回
            return unique(results);
        }
        //将select函数返回，用select全局变量接收，外部可以使用select函数的返回结果

        return select;
    })()
    //为了之后的更新维护或使用第三方更加严谨的插件，将select直接赋值给入口函数的select属性
    ty.select = select;
    // 将ty返回到外部，这样外部可以调用ty函数
    window.ty = window.t = ty;
})(window)//此处传入window是为了将闭包中的入口函数返回出来
