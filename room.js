module.exports = class room {

    constructor(name) {
        this._first = {
            name: null,
            number: parseInt(Math.random() * 10) % 2,
            socket: null
        };
        this._last = {
            name: null,
            number: this._first.number == 0 ? 1 : 0,
            socket: null
        };
        this.name = name;
        this.turn = 0;
        this.xo = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    }


    set firstPlayer(name) {
        this._first.name = name;
    }

    set lastPlayer(name) {
        this._last.name = name;
    }

    get firstPlayer() {
        return this._first;
    }

    get lastPlayer() {
        return this._last;
    }

    roomCheck() {
        if (this._first.name) {
            if (this._last.name) {
                return 2;
            }
            return 1;
        }
        return 0;
    }

    fill(i, j, player) {
        let result ={}
        if (this.xo[i][j] == undefined){
        if (player == this._first.name) {
            if (this._first.number == this.turn) {
                this.xo[i][j] = this._first.number;
                this.turn = (++this.turn) % 2;
                result.r = true;result.p=this._first.number;
            }
            else {
                result.r=false;
            }
        }
        else if (player == this._last.name) {
            if (this._last.number == this.turn) {
                this.xo[i][j] = this._last.number;
                this.turn = (++this.turn) % 2;
                result.r = true; result.p = this._last.number;
            }
            else {
                result.r = false;
            }
        }}
        else{
            result.r = false;
        }
        result.win = this.winCheck();
        return result;
    }
    winCheck(){
        let i0 = this.xo[0][0] + this.xo[0][1] + this.xo[0][2];
        let i1 = this.xo[1][0] + this.xo[1][1] + this.xo[1][2];
        let i2 = this.xo[2][0] + this.xo[2][1] + this.xo[2][2];
        let j0 = this.xo[0][0] + this.xo[1][0] + this.xo[2][0];
        let j1 = this.xo[0][1] + this.xo[1][1] + this.xo[2][1];
        let j2 = this.xo[0][2] + this.xo[1][2] + this.xo[2][2];
        let x0 = this.xo[0][0] + this.xo[1][1] + this.xo[2][2];
        let x1 = this.xo[0][2] + this.xo[1][1] + this.xo[2][0];
        if (i0 == 3|| i1 == 3 || i2 == 3 ||j0 == 3 || j1 == 3 || j2 == 3 || x1 == 3 || x0 == 3 ){
            return 1;
        }
        else if (i0 == 0 || i1 == 0 || i2 == 0 || j0 == 0 || j1 == 0 || j2 == 0 || x1 == 0 || x0 == 0 )
        {
            return 0
        }
        else{
            let i;
            for (i = 0; i < 9; i++) {
                if (this.xo[parseInt(i / 3)][i % 3] == undefined) {
                    break;
                }
            }
            if (i == 9) {
                return 2;
            }
            return -1;
        }
    }
}
