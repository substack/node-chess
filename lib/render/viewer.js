function Viewer (board, topside, players) {
    var self = this; 
    if (topside === undefined) topside = 'black';
    if (topside == 'w') topside = 'white';
    if (topside == 'b') topside = 'black';
    
    var area = {
        width : $(window).width() - 50,
        height : $(window).height() - 50 - 50
    };
    
    self.element = $('<div>')
        .addClass('board')
        .width(area.width)
        .height(area.height)
    ;
    
    var im = Raphael(self.element[0], area.width, area.height);
    
    im.rect(0, 0, area.width, area.height)
        .attr({ fill : '#CCC' });
    
    var mode = 'trap';
    
    function transform (x, y) {
        return transform[mode](x, y);
    }
    
    transform.trap = function (x, y) {
        var cx = 4, cy = 4;
        
        var wBottom = 1;
        var wTop = 0.7;
        var height = 0.4;

        var ynew = (y-cy) * height + cy;
        var xnew = (x-cx) * ( 0.5*(wTop + wBottom) - 0.25*(wBottom-wTop)*(y-cy) ) + cx;

        return {
            x: xnew*area.height/8 + (area.width-area.height)/2,
            y: (8-ynew) * area.height/8
        };
    }
    
    transform.rect = function (x, y) {
        var dim = Math.min(area.width, area.height);
        return {
            x : x * dim / 8 + (area.width - dim) / 2,
            y : (topside == 'white' ? y : 8 - y) * dim / 8
        };
    };
    
    function highlightOnOff(sq) {
        if (sq.attr('stroke') == 'green')
            sq.attr({ stroke : 'none' });
        else
            sq.attr({ stroke : 'green' });
    }

    function highlightOnOffFull(sq,x,y) {
        highlightOnOff(sq)
        players.white.moves(x,y).forEach(function (move) {
            highlightOnOff(cells[x][y]);
        });
    }

    var cells = [];
    for (var i = 0; i < 8; i++)
        cells[i] = [];

    range(8).reverse().forEach(function (y) {
        range(8).forEach(function (x) {
            cells[x][y] = Path(im).polygon([
                transform(x, y),
                transform(x, y + 1),
                transform(x + 1, y + 1),
                transform(x + 1, y)
            ]).attr({
                fill : (x + y) % 2 == 0 ? 'rgb(150,100,100)' : 'white',
                stroke : 'none'
            }).click(function () {
                highlightOnOffFull(this,x,y);
            });
        });
    });
    
    range(8).reverse().forEach(function (y) {
        range(8).forEach(function (x) {
            var p = board.pieceAt(x, y);
            if (p) {
                var dim = Math.min(area.width, area.height);
                var size = dim / 8;
                if ( mode === 'rect') {
                    var pos = transform(x, y + (topside == 'black' ? 1 : 0));
                } else {
                    //These numbers were just hard-coded & fiddled with fyi--no real reason for them
                    //except to make things look right.
                    var pos = transform(x, y + 0.5*(topside == 'black' ? 1 : 0));
                    pos.y = transform(x, y + 1.4*(topside == 'black' ? 2: 1)).y;
                }
                var file = '/images/' + p.color + '/' + p.code + '/'
                    + (topside.slice(0,1) == p.color ? 'front' : 'back')
                    + '.svg';
                if ( mode === 'rect' ) {
                    p.sprite = im.image(file, pos.x+2, pos.y+2, size-2, size-2);
                } else {
                    p.sprite = im.image(file, pos.x-12, pos.y+2, size-2, size-2);
                }
                p.sprite.click(function () {
                    highlightOnOffFull(cells[x][y],x,y);
                });
            }
        });
    });
}

function range (i,j,skip) {
    if (j === undefined) {
        j = i; i = 0;
    }
    if (skip === undefined) skip = 1;
    
    var acc = [];
    for (; i < j; i += skip) { acc.push(i) }
    return acc;
}

function Path (im) {
    var self = {};
    var path = [];
    
    self.move = function (x, y) {
        path.push(['M',x,y].join(' '));
        return self;
    };
    
    self.line = function (x, y) {
        path.push(['L',x,y].join(' '));
        return self;
    };
    
    self.__defineGetter__('close', function () {
        path.push('z');
        return self.end;
    });
    
    self.__defineGetter__('end', function () {
        return im.path(path.join(' '));
    });
    
    self.polygon = function (points) {
        var p0 = points.shift();
        self.move(p0.x, p0.y);
        points.forEach(function (p) {
            self.line(p.x, p.y);
        });
        return self.close;
    };
    
    return self;
}