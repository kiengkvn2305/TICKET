/* ==========================================================
   js/common/ticketExport.js
   Dùng chung cho cả trang nhân viên lẫn khách hàng.
   Cung cấp:
     - openHoaDonDetail(group)  — mở modal chi tiết hóa đơn
     - exportTickets(group)     — xuất vé ra cửa sổ in
   ========================================================== */

(function () {

    var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();window.QRCode=QRCode;function _generateQRBase64(text){return new Promise((resolve)=>{const temp=document.createElement("div");temp.style.position="absolute";temp.style.left="-9999px";temp.style.top="-9999px";document.body.appendChild(temp);let cleanText=text;try{cleanText=unescape(encodeURIComponent(text))}catch(e){}new QRCode(temp,{text:cleanText,width:120,height:120,colorDark:"#0f766e",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.L});const check=()=>{const img=temp.querySelector("img");if(img&&img.src&&img.src.startsWith("data:image")){const src=img.src;document.body.removeChild(temp);resolve(src)}else{const canvas=temp.querySelector("canvas");if(canvas){try{const src=canvas.toDataURL("image/png");document.body.removeChild(temp);resolve(src);return}catch(e){}}setTimeout(check,10)}};check()})}

    /* ── INJECT MODAL VÀO DOM (1 lần) ───────────────────── */
    function _injectModal() {
        if (document.getElementById("hdDetailModal")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <div id="hdDetailOverlay" style="
                display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);
                z-index:9000;backdrop-filter:blur(3px);"
                onclick="window._closeHoaDonDetail()">
            </div>
            <div id="hdDetailModal" style="
                display:none;position:fixed;top:50%;left:50%;
                transform:translate(-50%,-50%);
                background:#fff;border-radius:20px;
                box-shadow:0 20px 60px rgba(0,0,0,.2);
                width:min(680px,96vw);max-height:90vh;
                overflow-y:auto;z-index:9001;padding:32px;">
                <button onclick="window._closeHoaDonDetail()" style="
                    position:absolute;top:16px;right:16px;background:none;
                    border:none;font-size:1.4rem;cursor:pointer;color:#888;
                    line-height:1;">✕</button>
                <div id="hdDetailContent"></div>
            </div>
        `);
    }

    /* ── ĐỊNH NGHĨA SƠ ĐỒ ───────────────────────────────── */
    // Rect: 6 khu A-F (A/B/C = VIP, D/E/F = Thường)
    const RECT_ZONES = [
        { id: 'A', sub: 'Trái',  type: 'VIP'    },
        { id: 'B', sub: 'Giữa',  type: 'VIP'    },
        { id: 'C', sub: 'Phải',  type: 'VIP'    },
        { id: 'D', sub: 'Trái',  type: 'Thường' },
        { id: 'E', sub: 'Giữa',  type: 'Thường' },
        { id: 'F', sub: 'Phải',  type: 'Thường' },
    ];
    // Circle: 8 khu A-H (A-D = VIP, E-H = Thường)
    const CIRCLE_ZONES = [
        { id: 'A', dir: 'Tây Bắc',  type: 'VIP'    },
        { id: 'B', dir: 'Đông Bắc', type: 'VIP'    },
        { id: 'C', dir: 'Đông Nam', type: 'VIP'    },
        { id: 'D', dir: 'Tây Nam',  type: 'VIP'    },
        { id: 'E', dir: 'Tây Bắc',  type: 'Thường' },
        { id: 'F', dir: 'Đông Bắc', type: 'Thường' },
        { id: 'G', dir: 'Đông Nam', type: 'Thường' },
        { id: 'H', dir: 'Tây Nam',  type: 'Thường' },
    ];

    /* khuVuc lưu trong DB chỉ là chữ cái đơn: "A", "B", ... */
    function _zoneOf(seatId) {
        return String(seatId || '').trim().toUpperCase() || null;
    }

    function _resolveLayout(loaiSoDo) {
        if (!loaiSoDo) return 'rect';
        const n = String(loaiSoDo).trim().toUpperCase();
        return (n.includes('TRON') || n.includes('TRÒN') || n === 'CIRCLE')
            ? 'circle' : 'rect';
    }

    /* ── FETCH loaiSoDo từ sukien → diadiem ──────────────── */
    async function _fetchLoaiSoDo(maSuKien) {
        if (!maSuKien) return '';
        try {
            const sk = await apiFetch(`/sukien/${maSuKien}`);
            // loaiSoDo có thể nằm thẳng trên sukien hoặc trong object diaDiem
            const fromSk = sk.loaiSoDo || sk.LoaiSoDo || '';
            if (fromSk) return fromSk;

            const maDiaDiem = sk.maDiaDiem || sk.MaDiaDiem;
            if (!maDiaDiem) return '';

            const dd = await apiFetch(`/diadiem/${maDiaDiem}`);
            return dd.loaiSoDo || dd.LoaiSoDo || dd.loaisodo || '';
        } catch {
            return '';
        }
    }

    /* ── LẤY GHẾ ĐÃ ĐẶT TỪ API ─────────────────────────── */
    async function _fetchBookedSeats(maSuKien) {
        if (!maSuKien) return new Set();
        try {
            const data = await apiFetch(`/sukien/${maSuKien}/ghe-da-dat`);
            // API trả mảng string hoặc object; khuVuc là chữ cái đơn
            return new Set((data || []).map(g =>
                typeof g === 'string' ? g.trim().toUpperCase()
                    : (g.khuVuc || g.maGhe || g.seatId || g.id || '')
                        .toString().trim().toUpperCase()
            ).filter(Boolean));
        } catch {
            return new Set();
        }
    }

    /* ── LẤY TẤT CẢ KHU VỰC TRONG VÉ ───────────────────── */
    function _getAllMySeats(group) {
        const seats = new Set();
        (group.tickets || []).forEach(ve => {
            _parseSeatList(ve).forEach(s => seats.add(s));
        });
        return seats;
    }

    /* ── BUILD SƠ ĐỒ RECT (modal) ───────────────────────── */
    function _buildRectMapHtml(mySeats, takenSeats) {
        const sections = [
            { label: '🌟 Khu VIP',    zones: ['A','B','C'] },
            { label: '🔵 Khu Thường', zones: ['D','E','F'] },
        ];
        let html = `<div class="sm-wrap">
            <div class="sm-screen">🎭 SÂN KHẤU / MÀN HÌNH CHIẾU</div>`;
        sections.forEach(sec => {
            html += `<div class="sm-sec-title">${sec.label}</div>
                     <div class="sm-zone-row">`;
            sec.zones.forEach(zid => {
                const zDef  = RECT_ZONES.find(z => z.id === zid);
                const isMine   = mySeats.has(zid);
                const isBooked = !isMine && takenSeats.has(zid);
                const type  = zDef ? zDef.type : 'Thường';
                let cls = `sm-zone-card sm-zone-${type}`;
                if (isMine)        cls += ' sm-zone-mine';
                else if (isBooked) cls += ' sm-zone-booked';
                html += `<div class="${cls}">
                    <div class="sm-zone-label">${zid}</div>
                    <div class="sm-zone-sub">${zDef ? zDef.sub : ''}</div>
                    ${isMine   ? `<div class="sm-zone-badge">Ghế của bạn</div>` : ''}
                    ${isBooked ? `<div class="sm-zone-badge sm-zone-badge-booked">Đã đặt</div>` : ''}
                </div>`;
            });
            html += `</div>`;
        });
        html += `<div class="sm-legend">
            <span class="sm-dot sm-zone-mine"></span> Ghế của bạn &nbsp;
            <span class="sm-dot sm-zone-booked"></span> Đã đặt &nbsp;
            <span class="sm-dot sm-zone-vip"></span> VIP trống &nbsp;
            <span class="sm-dot sm-zone-normal"></span> Thường trống
        </div></div>`;
        return html;
    }

    /* ── BUILD SƠ ĐỒ CIRCLE (modal) SVG ─────────────────── */
    function _buildCircleMapHtml(mySeats, takenSeats) {
        const quadrants = [
            { id:'A', type:'VIP',    s:200, e:270, r1:65,  r2:100 },
            { id:'B', type:'VIP',    s:290, e:360, r1:65,  r2:100 },
            { id:'C', type:'VIP',    s:20,  e:90,  r1:65,  r2:100 },
            { id:'D', type:'VIP',    s:110, e:180, r1:65,  r2:100 },
            { id:'E', type:'Thường', s:200, e:270, r1:110, r2:150 },
            { id:'F', type:'Thường', s:290, e:360, r1:110, r2:150 },
            { id:'G', type:'Thường', s:20,  e:90,  r1:110, r2:150 },
            { id:'H', type:'Thường', s:110, e:180, r1:110, r2:150 },
        ];
        function arc(cx,cy,r1,r2,sD,eD){
            const toR=d=>d*Math.PI/180;
            const s=toR(sD),e=toR(eD),lg=(eD-sD)>180?1:0;
            return `M${cx+r2*Math.cos(s)},${cy+r2*Math.sin(s)}`
                 + ` A${r2},${r2} 0 ${lg},1 ${cx+r2*Math.cos(e)},${cy+r2*Math.sin(e)}`
                 + ` L${cx+r1*Math.cos(e)},${cy+r1*Math.sin(e)}`
                 + ` A${r1},${r1} 0 ${lg},0 ${cx+r1*Math.cos(s)},${cy+r1*Math.sin(s)}Z`;
        }
        const cx=180, cy=180;
        let paths = `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="38"
                       fill="#ffb3c1" stroke="#e05080" stroke-width="2"/>
                     <text x="${cx}" y="${cy-4}" text-anchor="middle"
                       font-size="11" fill="#c0355a" font-weight="bold">Sân khấu</text>
                     <text x="${cx}" y="${cy+9}" text-anchor="middle"
                       font-size="9" fill="#c0355a">Màn hình chiếu</text>`;
        quadrants.forEach(q => {
            const isMine   = mySeats.has(q.id);
            const isBooked = !isMine && takenSeats.has(q.id);
            const fill   = isMine   ? '#81c784'
                         : isBooked ? '#e0e0e0'
                         : q.type === 'VIP' ? '#f7d060' : '#7ec8f7';
            const stroke = isMine   ? '#388e3c'
                         : isBooked ? '#bbb'
                         : q.type === 'VIP' ? '#c98f00' : '#2176c7';
            const txtC   = isMine   ? '#14532d'
                         : isBooked ? '#999'
                         : q.type === 'VIP' ? '#6b4800' : '#0d3c6e';
            const mid = ((q.s + q.e) / 2) * Math.PI / 180;
            const mr  = (q.r1 + q.r2) / 2;
            const lx  = cx + mr * Math.cos(mid);
            const ly  = cy + mr * Math.sin(mid);
            const zDef = CIRCLE_ZONES.find(z => z.id === q.id);
            paths += `<path d="${arc(cx,cy,q.r1,q.r2,q.s,q.e)}"
                        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
                      <text x="${lx}" y="${ly-4}" text-anchor="middle"
                        font-size="12" font-weight="bold" fill="${txtC}">${q.id}</text>
                      <text x="${lx}" y="${ly+8}" text-anchor="middle"
                        font-size="8" fill="${txtC}">${zDef ? zDef.dir : ''}</text>`;
            if (isMine) {
                const bx = cx + q.r2 * Math.cos(mid);
                const by = cy + q.r2 * Math.sin(mid);
                paths += `<circle cx="${bx}" cy="${by}" r="9"
                            fill="#388e3c" stroke="#fff" stroke-width="1.5"/>
                          <text x="${bx}" y="${by+4}" text-anchor="middle"
                            font-size="9" fill="#fff" font-weight="bold">✓</text>`;
            }
        });
        return `<div class="sm-wrap">
            <svg viewBox="0 0 360 360"
                 style="width:100%;max-width:300px;display:block;margin:0 auto">${paths}</svg>
            <div class="sm-legend" style="justify-content:center">
                <span class="sm-dot sm-zone-mine"></span> Ghế của bạn &nbsp;
                <span class="sm-dot sm-zone-booked"></span> Đã đặt &nbsp;
                <span class="sm-dot sm-zone-vip"></span> VIP trống &nbsp;
                <span class="sm-dot sm-zone-normal"></span> Thường trống
            </div>
        </div>`;
    }

    /* ── BUILD SƠ ĐỒ RECT (in) ──────────────────────────── */
    function _buildRectMapPrint(mySeats, takenSeats) {
        const sections = [
            { label: '🌟 Khu VIP',    zones: ['A','B','C'] },
            { label: '🔵 Khu Thường', zones: ['D','E','F'] },
        ];
        let html = `<div class="sm-wrap-print">
            <div class="sm-screen-print">🎭 SÂN KHẤU / MÀN HÌNH CHIẾU</div>`;
        sections.forEach(sec => {
            html += `<div style="font-size:.62rem;font-weight:700;color:#555;margin:6px 0 3px">${sec.label}</div>
                     <div style="display:flex;gap:5px;margin-bottom:4px">`;
            sec.zones.forEach(zid => {
                const zDef   = RECT_ZONES.find(z => z.id === zid);
                const type   = zDef ? zDef.type : 'Thường';
                const isMine   = mySeats.has(zid);
                const isBooked = !isMine && takenSeats.has(zid);
                const bg     = isMine   ? '#81c784'
                             : isBooked ? '#e0e0e0'
                             : type === 'VIP' ? '#f7d060' : '#7ec8f7';
                const border = isMine   ? '#388e3c'
                             : isBooked ? '#bbb'
                             : type === 'VIP' ? '#c98f00' : '#2176c7';
                const txtC   = isMine   ? '#14532d'
                             : isBooked ? '#999'
                             : type === 'VIP' ? '#6b4800' : '#0d3c6e';
                html += `<div style="flex:1;min-height:52px;border-radius:8px;background:${bg};
                              border:2px solid ${border};display:flex;flex-direction:column;
                              align-items:center;justify-content:center;gap:2px;padding:4px">
                    <div style="font-size:.85rem;font-weight:800;color:${txtC}">${zid}</div>
                    <div style="font-size:.5rem;color:${txtC}">${zDef ? zDef.sub : ''}</div>
                    ${isMine ? `<div style="font-size:.48rem;font-weight:700;background:#15803d;
                        color:#fff;border-radius:4px;padding:1px 4px;margin-top:1px">Ghế bạn</div>` : ''}
                </div>`;
            });
            html += `</div>`;
        });
        html += `<div class="sm-legend-print">
            <span class="sm-dot-print" style="background:#81c784;border:1px solid #388e3c"></span> Ghế của bạn &nbsp;
            <span class="sm-dot-print" style="background:#e0e0e0;border:1px solid #bbb"></span> Đã đặt &nbsp;
            <span class="sm-dot-print" style="background:#f7d060;border:1px solid #c98f00"></span> VIP &nbsp;
            <span class="sm-dot-print" style="background:#7ec8f7;border:1px solid #2176c7"></span> Thường
        </div></div>`;
        return html;
    }

    /* ── BUILD SƠ ĐỒ CIRCLE (in) SVG ───────────────────── */
    function _buildCircleMapPrint(mySeats, takenSeats) {
        const quadrants = [
            { id:'A', type:'VIP',    s:200, e:270, r1:55,  r2:85  },
            { id:'B', type:'VIP',    s:290, e:360, r1:55,  r2:85  },
            { id:'C', type:'VIP',    s:20,  e:90,  r1:55,  r2:85  },
            { id:'D', type:'VIP',    s:110, e:180, r1:55,  r2:85  },
            { id:'E', type:'Thường', s:200, e:270, r1:92,  r2:128 },
            { id:'F', type:'Thường', s:290, e:360, r1:92,  r2:128 },
            { id:'G', type:'Thường', s:20,  e:90,  r1:92,  r2:128 },
            { id:'H', type:'Thường', s:110, e:180, r1:92,  r2:128 },
        ];
        function arc(cx,cy,r1,r2,sD,eD){
            const toR=d=>d*Math.PI/180;
            const s=toR(sD),e=toR(eD),lg=(eD-sD)>180?1:0;
            return `M${cx+r2*Math.cos(s)},${cy+r2*Math.sin(s)}`
                 + ` A${r2},${r2} 0 ${lg},1 ${cx+r2*Math.cos(e)},${cy+r2*Math.sin(e)}`
                 + ` L${cx+r1*Math.cos(e)},${cy+r1*Math.sin(e)}`
                 + ` A${r1},${r1} 0 ${lg},0 ${cx+r1*Math.cos(s)},${cy+r1*Math.sin(s)}Z`;
        }
        const cx=150, cy=150;
        let paths = `<ellipse cx="${cx}" cy="${cy}" rx="44" ry="32"
                       fill="#ffb3c1" stroke="#e05080" stroke-width="1.5"/>
                     <text x="${cx}" y="${cy-3}" text-anchor="middle"
                       font-size="10" fill="#c0355a" font-weight="bold">Sân khấu</text>
                     <text x="${cx}" y="${cy+8}" text-anchor="middle"
                       font-size="7.5" fill="#c0355a">Màn hình</text>`;
        quadrants.forEach(q => {
            const isMine   = mySeats.has(q.id);
            const isBooked = !isMine && takenSeats.has(q.id);
            const fill   = isMine   ? '#81c784'
                         : isBooked ? '#e0e0e0'
                         : q.type === 'VIP' ? '#f7d060' : '#7ec8f7';
            const stroke = isMine   ? '#388e3c'
                         : isBooked ? '#bbb'
                         : q.type === 'VIP' ? '#c98f00' : '#2176c7';
            const txtC   = isMine   ? '#14532d'
                         : isBooked ? '#999'
                         : q.type === 'VIP' ? '#6b4800' : '#0d3c6e';
            const mid = ((q.s + q.e) / 2) * Math.PI / 180;
            const mr  = (q.r1 + q.r2) / 2;
            const lx  = cx + mr * Math.cos(mid);
            const ly  = cy + mr * Math.sin(mid);
            const zDef = CIRCLE_ZONES.find(z => z.id === q.id);
            paths += `<path d="${arc(cx,cy,q.r1,q.r2,q.s,q.e)}"
                        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
                      <text x="${lx}" y="${ly-3}" text-anchor="middle"
                        font-size="11" font-weight="bold" fill="${txtC}">${q.id}</text>
                      <text x="${lx}" y="${ly+7}" text-anchor="middle"
                        font-size="7" fill="${txtC}">${zDef ? zDef.dir : ''}</text>`;
            if (isMine) {
                const bx = cx + q.r2 * Math.cos(mid);
                const by = cy + q.r2 * Math.sin(mid);
                paths += `<circle cx="${bx}" cy="${by}" r="8"
                            fill="#388e3c" stroke="#fff" stroke-width="1.5"/>
                          <text x="${bx}" y="${by+3}" text-anchor="middle"
                            font-size="8" fill="#fff" font-weight="bold">✓</text>`;
            }
        });
        return `<div class="sm-wrap-print">
            <svg viewBox="0 0 300 300"
                 style="width:100%;max-width:260px;display:block;margin:0 auto">${paths}</svg>
            <div class="sm-legend-print">
                <span class="sm-dot-print" style="background:#81c784;border:1px solid #388e3c"></span> Ghế của bạn &nbsp;
                <span class="sm-dot-print" style="background:#e0e0e0;border:1px solid #bbb"></span> Đã đặt &nbsp;
                <span class="sm-dot-print" style="background:#f7d060;border:1px solid #c98f00"></span> VIP &nbsp;
                <span class="sm-dot-print" style="background:#7ec8f7;border:1px solid #2176c7"></span> Thường
            </div>
        </div>`;
    }

    /* ── DISPATCH: chọn đúng hàm theo loaiSoDo ──────────── */
    function _buildSeatMapHtml(mySeats, takenSeats, loaiSoDo) {
        return _resolveLayout(loaiSoDo) === 'circle'
            ? _buildCircleMapHtml(mySeats, takenSeats)
            : _buildRectMapHtml(mySeats, takenSeats);
    }
    function _buildSeatMapHtmlRaw(mySeats, takenSeats, loaiSoDo) {
        return _resolveLayout(loaiSoDo) === 'circle'
            ? _buildCircleMapPrint(mySeats, takenSeats)
            : _buildRectMapPrint(mySeats, takenSeats);
    }

    /* ── CSS SƠ ĐỒ GHẾ (modal) ──────────────────────────── */
    const SEAT_CSS = `
        .sm-wrap{margin:14px 0 6px}
        .sm-screen{text-align:center;background:linear-gradient(180deg,#555,#888);
            color:#fff;border-radius:8px 8px 0 0;padding:7px;font-size:.7rem;
            font-weight:700;letter-spacing:1px;margin-bottom:14px}
        .sm-sec-title{font-size:.75rem;font-weight:700;color:#555;margin:8px 0 5px;letter-spacing:.5px}
        .sm-zone-row{display:flex;gap:8px;margin-bottom:8px}
        .sm-zone-card{flex:1;min-height:72px;border-radius:10px;border:2px solid transparent;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            gap:3px;padding:8px 4px}
        .sm-zone-vip{background:linear-gradient(135deg,#fff8d6,#f7d060);border-color:#c98f00}
        .sm-zone-normal{background:linear-gradient(135deg,#dff0fb,#7ec8f7);border-color:#2176c7}
        .sm-zone-mine{background:linear-gradient(135deg,#c8f0cb,#81c784)!important;border-color:#388e3c!important}
        .sm-zone-booked{background:#f3f4f6!important;border-color:#d1d5db!important;opacity:.6}
        .sm-zone-label{font-size:.95rem;font-weight:800;color:#333}
        .sm-zone-sub{font-size:.58rem;font-weight:600;color:#666}
        .sm-zone-badge{font-size:.58rem;font-weight:700;background:#15803d;color:#fff;
            border-radius:8px;padding:1px 6px;margin-top:2px}
        .sm-zone-badge-booked{background:#9ca3af}
        .sm-legend{display:flex;align-items:center;flex-wrap:wrap;gap:10px;
            margin-top:10px;font-size:.72rem;color:#666}
        .sm-dot{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle}
        .sm-dot.sm-zone-mine{background:#81c784;border:1px solid #388e3c}
        .sm-dot.sm-zone-booked{background:#e0e0e0;border:1px solid #bbb}
        .sm-dot.sm-zone-vip{background:#f7d060;border:1px solid #c98f00}
        .sm-dot.sm-zone-normal{background:#7ec8f7;border:1px solid #2176c7}
    `;
    function _injectSeatCSS() {
        if (document.getElementById("_smCSS")) return;
        const s = document.createElement("style");
        s.id = "_smCSS"; s.textContent = SEAT_CSS;
        document.head.appendChild(s);
    }

    /* ── RENDER NÚT XUẤT VÉ ─────────────────────────────── */
    function _renderExportBtn(ve, group) {
        const soLuong = ve.soLuong || 0;
        const daHoan  = ve.soLuongHoan || 0;
        const conLai  = Math.max(0, soLuong - daHoan);
        const cacheKey = `hd_${group.maHoaDon}`;

        if (ve.trangThaiHoan === "approved" && conLai === 0) {
            const hoanLabel = daHoan > 0 ? daHoan + " vé" : "";
            return `<span style="margin-top:6px;display:inline-block;padding:5px 14px;
                         background:#d1fae5;color:#065f46;border-radius:20px;
                         font-size:.78rem;font-weight:700;font-family:'Inter',sans-serif">
                        💚 Đã hoàn ${hoanLabel}
                    </span>`;
        }
        const label = (ve.trangThaiHoan === "approved" && daHoan > 0)
            ? `🎫 Xuất vé còn lại (${conLai})` : "🎫 Xuất vé";
        const badge = (ve.trangThaiHoan === "approved" && daHoan > 0)
            ? `<span style="margin-top:6px;display:inline-block;padding:3px 10px;
                    background:#d1fae5;color:#065f46;border-radius:20px;
                    font-size:.72rem;font-weight:700;font-family:'Inter',sans-serif">
                    💚 Hoàn ${daHoan}/${soLuong} vé
                </span>` : "";
        // Dùng cache key thay vì nhúng JSON vào onclick
        return badge + `<button
            onclick="(function(){var g=window._ticketExportCache&&window._ticketExportCache.get('${cacheKey}');if(g)window.exportTickets(g,${ve.maVe});})()"
            style="margin-top:6px;padding:5px 14px;background:#0d9488;color:#fff;
                   border:none;border-radius:20px;font-size:.78rem;font-weight:700;
                   cursor:pointer;font-family:'Inter',sans-serif">
            ${label}
        </button>`;
    }

    /* ── RENDER NÚT XUẤT TẤT CẢ VÉ ─────────────────────── */
    function _renderExportAllBtn(group) {
        const totalConLai = group.tickets.reduce((sum, v) => {
            const sl = v.soLuong || 0;
            if (v.trangThaiHoan === "approved")
                return sum + Math.max(0, sl - (v.soLuongHoan || sl));
            return sum + sl;
        }, 0);
        if (totalConLai === 0) return "";
        const cacheKey = `hd_${group.maHoaDon}`;
        return `<div style="text-align:center">
                    <button onclick="(function(){var g=window._ticketExportCache&&window._ticketExportCache.get('${cacheKey}');if(g)window.exportTickets(g,null);})()"
                        style="padding:11px 28px;background:#0d9488;color:#fff;border:none;
                               border-radius:12px;font-size:.95rem;font-weight:700;cursor:pointer;
                               font-family:'Inter',sans-serif;width:100%">
                        🎫 Xuất tất cả vé còn hiệu lực (${totalConLai})
                    </button>
                </div>`;
    }

    /* ── MỞ MODAL CHI TIẾT HÓA ĐƠN ─────────────────────── */
    window.openHoaDonDetail = async function (group) {
        _injectModal();
        _injectSeatCSS();

        // Lưu vào cache để nút xuất vé trong modal dùng lại
        if (!window._ticketExportCache) window._ticketExportCache = new Map();
        window._ticketExportCache.set(`hd_${group.maHoaDon}`, group);

        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";
        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };
        const showDiscount = group.thanhTienGoc && group.thanhTien &&
                             group.thanhTien < group.thanhTienGoc;

        const rows = group.tickets.map(ve => {
            const seatLabel = _formatSeatLabel(ve);
            return `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;
                        padding:12px 0;border-bottom:1px solid #f0f0f0;gap:12px;flex-wrap:wrap">
                <div>
                    <div style="font-weight:700;color:#1a1a2e;font-size:.95rem">${_esc(ve.tenVe || "—")}</div>
                    <div style="font-size:.8rem;color:#888;margin-top:3px">
                        ${_esc(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong>
                        · ${fmt(ve.gia)}/vé
                    </div>
                    ${seatLabel ? `
                    <div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;
                                 background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                                 padding:3px 9px;font-size:.78rem;font-weight:700;color:#15803d">
                        💺 Khu: ${_esc(seatLabel)}
                    </div>` : ""}
                </div>
                <div style="text-align:right">
                    <div style="font-weight:700;font-size:1rem">${fmt(ve.gia * ve.soLuong)}</div>
                    ${_renderExportBtn(ve, group)}
                </div>
            </div>`;
        }).join("");

        // Fetch loaiSoDo từ sukien → diadiem, và bookedSeats song song
        const mySeats = _getAllMySeats(group);
        const [bookedSeats, loaiSoDo] = await Promise.all([
            _fetchBookedSeats(group.maSuKien),
            _fetchLoaiSoDo(group.maSuKien),
        ]);
        mySeats.forEach(s => bookedSeats.add(s));

        const seatMapHtml = mySeats.size > 0
            ? `<div style="margin-bottom:18px">
                <div style="font-weight:700;font-size:.9rem;color:#1a1a2e;margin-bottom:6px">
                    🗺️ Sơ đồ ghế ngồi
                </div>
                ${_buildSeatMapHtml(mySeats, bookedSeats, loaiSoDo)}
               </div>` : "";

        document.getElementById("hdDetailContent").innerHTML = `
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:1.8rem">🧾</div>
                <h2 style="margin:4px 0;font-size:1.2rem;font-family:'Inter',sans-serif">
                    Chi tiết hóa đơn #${group.maHoaDon}
                </h2>
                <p style="color:#888;font-size:.85rem;margin:0">
                    📅 ${fmtDate(group.ngayMua)} &nbsp;·&nbsp; 📍 ${_esc(group.tenSuKien || "—")}
                </p>
            </div>
            <div style="background:#f9fafb;border-radius:12px;padding:14px;margin-bottom:18px;
                        font-size:.85rem;color:#555;display:flex;justify-content:space-between;
                        flex-wrap:wrap;gap:8px">
                <div>Tổng gốc: <strong style="color:#1a1a2e">${fmt(group.thanhTienGoc || group.thanhTien)}</strong></div>
                ${showDiscount ? `<div style="color:#16a34a">Sau giảm giá: <strong>${fmt(group.thanhTien)}</strong></div>` : ""}
                <div>Thanh toán: <strong style="color:#dc2626;font-size:1rem">${fmt(group.thanhTien)}</strong></div>
            </div>
            <div style="margin-bottom:18px">${rows}</div>
            ${seatMapHtml}
            ${_renderExportAllBtn(group)}
        `;
        document.getElementById("hdDetailOverlay").style.display = "block";
        document.getElementById("hdDetailModal").style.display   = "block";
    };

    window._closeHoaDonDetail = function () {
        document.getElementById("hdDetailOverlay").style.display = "none";
        document.getElementById("hdDetailModal").style.display   = "none";
    };

    /* ── XUẤT VÉ RA CỬA SỔ IN ───────────────────────────── */
    window.exportTickets = async function (group, filterMaVe) {
        const tickets = filterMaVe != null
            ? group.tickets.filter(v => v.maVe == filterMaVe)
            : group.tickets;

        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };
        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";

        // Fetch loaiSoDo từ sukien → diadiem, và bookedSeats song song
        const [bookedSeats, loaiSoDo] = await Promise.all([
            _fetchBookedSeats(group.maSuKien),
            _fetchLoaiSoDo(group.maSuKien),
        ]);
        const allGroupSeats = _getAllMySeats(group);
        allGroupSeats.forEach(s => bookedSeats.add(s));

        const cards = tickets.flatMap(ve => {
            const gheConLai  = (ve.gheList || []).filter(g => g.trangThai !== "da_hoan");
            const soLuongXuat = gheConLai.length || ve.soLuong || 0;
            if (soLuongXuat === 0) return [];
            return Array.from({ length: soLuongXuat }, (_, i) => {
                const ghe      = gheConLai[i] || null;
                // khuVuc lưu chỉ là chữ cái đơn, ví dụ "A"
                const mySeat   = ghe ? String(ghe.khuVuc || '').trim().toUpperCase() : null;
                const mySeatSet = mySeat ? new Set([mySeat]) : new Set();
                const ticketCode = `TK-${group.maHoaDon}-${ve.maVe}-${i + 1}`;

                const qrText = "Mã vé: " + ticketCode + "\n" +
                               "Khách hàng: " + (group.tenKhachHang || "Khách vãng lai") + "\n" +
                               "Sự kiện: " + (group.tenSuKien || "") + "\n" +
                               (mySeat ? "Vị trí: Khu " + mySeat + "\n" : "") +
                               "Giá vé: " + fmt(ve.gia) + "\n" +
                               "Trạng thái: ĐÃ THANH TOÁN";

                const qrSrc = `/api/qrcode/generate?text=${encodeURIComponent(qrText)}&width=300&height=300`;

                return _buildTicketCard(
                    ve, group, i + 1, fmtDate, fmt,
                    mySeat, mySeatSet, bookedSeats,
                    ve.soLuong, soLuongXuat, loaiSoDo, qrSrc
                );
            });
        }).join("");

        // Sơ đồ tổng quan: dùng tất cả khu trong hóa đơn
        const groupSeatSet = _getAllMySeats({ tickets });
        const overviewMapHtml = groupSeatSet.size > 0
            ? `<div class="overview-map">
                <h3 style="text-align:center;margin:0 0 8px;font-size:.95rem;color:#555">
                    🗺️ Sơ đồ ghế — Tất cả vé trong hóa đơn #${group.maHoaDon}
                </h3>
                ${_buildSeatMapHtmlRaw(groupSeatSet, bookedSeats, loaiSoDo)}
               </div>` : "";

        const win = window.open("", "_blank", "width=700,height=600");
        if (!win) {
            alert("Trình duyệt đang chặn popup. Vui lòng click vào biểu tượng 🚫 trên thanh địa chỉ và cho phép popup từ trang này.");
            return;
        }
        win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Vé — ${_escRaw(group.tenSuKien || "Sự kiện")}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f0f4f8; padding:24px; }
  .page-title { text-align:center; font-size:1.1rem; color:#555; margin-bottom:24px; font-weight:600; letter-spacing:.5px; }
  .ticket-wrap { break-inside:avoid; margin-bottom:24px; }
  .ticket { width:100%; max-width:620px; margin:0 auto; background:#fff; border-radius:18px; box-shadow:0 4px 20px rgba(0,0,0,.12); overflow:hidden; display:flex; flex-direction:column; }
  .ticket-header { background:linear-gradient(135deg,#0d9488,#0f766e); color:#fff; padding:22px 28px 18px; }
  .ticket-header .event-name { font-size:1.3rem; font-weight:800; line-height:1.3; margin-bottom:6px; }
  .ticket-header .event-dates { font-size:.82rem; opacity:.85; display:flex; gap:16px; flex-wrap:wrap; }
  .ticket-body { padding:20px 28px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap; }
  .ticket-info { flex:1; min-width:200px; }
  .info-row { margin-bottom:10px; }
  .info-label { font-size:.72rem; color:#888; font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
  .info-value { font-size:.95rem; color:#1a1a2e; font-weight:600; }
  .info-value.seat-value { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:10px; padding:4px 12px; color:#15803d; font-size:1rem; font-weight:800; letter-spacing:.5px; }
  .ticket-qr { display:flex; flex-direction:column; align-items:center; gap:8px; min-width:150px; }
  .qr-box { width:148px; height:148px; border:2px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#fff; display:flex; align-items:center; justify-content:center; }
  .qr-box img, .qr-box canvas { width:140px !important; height:140px !important; display:block; }
  .ticket-id { font-size:.7rem; color:#888; font-family:monospace; text-align:center; }
  .ticket-footer { border-top:2px dashed #e5e7eb; padding:12px 28px; background:#fafafa; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
  .ticket-footer .price { font-size:1.2rem; font-weight:800; color:#0d9488; }
  .ticket-footer .badge { background:#dcfce7; color:#15803d; font-size:.75rem; font-weight:700; padding:4px 12px; border-radius:20px; }
  .serial { font-size:.72rem; color:#aaa; }
  .seat-map-section { padding:14px 28px 18px; border-top:1px dashed #e5e7eb; }
  .seat-map-title { font-size:.78rem; font-weight:700; color:#555; margin-bottom:8px; text-align:center; }
  .sm-screen-print { text-align:center; background:linear-gradient(180deg,#555,#888); color:#fff; border-radius:6px 6px 0 0; padding:5px; font-size:.62rem; font-weight:700; letter-spacing:1px; margin-bottom:8px; max-width:300px; margin-left:auto; margin-right:auto; }
  .sm-legend-print { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:6px; font-size:.62rem; color:#666; justify-content:center; }
  .sm-dot-print { display:inline-block; width:10px; height:10px; border-radius:2px; vertical-align:middle; }
  .overview-map { max-width:620px; margin:0 auto 28px; background:#fff; border-radius:14px; padding:20px 24px; box-shadow:0 4px 16px rgba(0,0,0,.1); }
  @media print {
      body { background:#fff; padding:0; }
      .page-title { display:none; }
      .ticket-wrap { page-break-after:always; margin:0; }
      .ticket { box-shadow:none; border:1px solid #e5e7eb; }
      .overview-map { box-shadow:none; border:1px solid #e5e7eb; page-break-after:always; }
  }
</style>
</head>
<body>
<div class="page-title">🎫 Vé sự kiện — In hoặc lưu PDF</div>
${overviewMapHtml}
${cards}
<script>
  setTimeout(() => window.print(), 800);
</script>
</body>
</html>`);
        win.document.close();
    };

    /* ── BUILD 1 TẤM VÉ ─────────────────────────────────── */
    function _buildTicketCard(ve, group, idx, fmtDate, fmt, seatLabel, mySeatSet, bookedSeats, soLuongGoc, soLuongXuat, loaiSoDo, qrSrc) {
        const soLuong    = soLuongGoc || ve.soLuong || 0;
        const xuat       = soLuongXuat || soLuong;
        const ticketCode = `TK-${group.maHoaDon}-${ve.maVe}-${idx}`;

        const seatRow = seatLabel ? `
                    <div class="info-row">
                        <div class="info-label">💺 Khu ghế</div>
                        <div class="info-value seat-value">Khu ${_escRaw(seatLabel)}</div>
                    </div>` : "";

        const seatMapSection = mySeatSet.size > 0 ? `
            <div class="seat-map-section">
                <div class="seat-map-title">🗺️ Vị trí ghế của bạn</div>
                ${_buildSeatMapHtmlRaw(mySeatSet, bookedSeats, loaiSoDo)}
            </div>` : "";

        let vesoRow = "";
        if (soLuong > 1) {
            const veIdx  = idx - (soLuong - xuat);
            const suffix = xuat < soLuong
                ? ` <span style="font-size:.72rem;color:#888">(còn lại / ${soLuong} ban đầu)</span>` : "";
            vesoRow = `<div class="info-row"><div class="info-label">Vé số</div><div class="info-value">${veIdx} / ${xuat}${suffix}</div></div>`;
        }

        return `
        <div class="ticket-wrap">
          <div class="ticket">
            <div class="ticket-header">
                <div class="event-name">${_escRaw(group.tenSuKien || "Sự kiện")}</div>
                <div class="event-dates">
                    <span>📅 Bắt đầu: ${fmtDate(group.thoiGianBatDau || ve.thoiGianBatDau)}</span>
                    <span>🏁 Kết thúc: ${fmtDate(group.thoiGianKetThuc || ve.thoiGianKetThuc)}</span>
                </div>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="info-row">
                        <div class="info-label">Loại vé</div>
                        <div class="info-value">${_escRaw(ve.tenVe || "—")}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phân loại</div>
                        <div class="info-value">${_escRaw(ve.loaiVe || "—")}</div>
                    </div>
                    ${seatRow}
                    <div class="info-row">
                        <div class="info-label">Mã hóa đơn</div>
                        <div class="info-value">#${group.maHoaDon}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Ngày mua</div>
                        <div class="info-value">${fmtDate(group.ngayMua)}</div>
                    </div>
                    ${vesoRow}
                </div>
                <div class="ticket-qr">
                    <div class="qr-box">
                        ${qrSrc ? `<img src="${qrSrc}" alt="QR" />` : `<div id="qr-${ticketCode}"></div>`}
                    </div>
                    <div class="ticket-id">${ticketCode}</div>
                </div>
            </div>
            ${seatMapSection}
            <div class="ticket-footer">
                <div>
                    <div class="price">${fmt(ve.gia)}</div>
                    <div class="serial">HĐ #${group.maHoaDon} · Vé #${ve.maVe}</div>
                </div>
                <span class="badge">✅ ĐÃ THANH TOÁN</span>
            </div>
          </div>
        </div>`;
    }

    /* ── HELPERS GHẾ ─────────────────────────────────────── */
    function _parseSeatList(ve) {
        // khuVuc lưu chỉ là chữ cái đơn: "A", "B", ...
        const raw = ve.gheDat ?? ve.khuVuc ?? ve.soGhe ?? ve.gheSo ?? null;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map(s => String(s).trim().toUpperCase()).filter(Boolean);
        if (typeof raw === "string")
            return raw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
        return [String(raw).trim().toUpperCase()];
    }

    function _formatSeatLabel(ve) {
        const list = _parseSeatList(ve);
        return list.length ? list.join(", ") : "";
    }

    /* ── ESCAPE HELPERS ──────────────────────────────────── */
    function _esc(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;")
            .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    function _escRaw(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

})();