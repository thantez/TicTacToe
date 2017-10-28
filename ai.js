class ai {
    constructor(number) {
        this.name = 'robat';
        this.hardness = parseInt(Math.random() * 10);
        this.hardness = this.hardness == 9 ? 3 : this.hardness % 3;
        this.number = number;
        this.enemyNumber = (this.number+1)%2;
        console.log('hardness is ' + this.hardness.toString());
        //this switch set pointer of move to hardness case
        switch (this.hardness) {
            case 0:
                this.move = this.easy;
                break;
            case 1:
                this.move = this.normal;
                break;
            case 2:
                this.move = this.hard;
                break;
            case 3:
                this.move = this.veryHard;
                break;
        }
    }
    status(xo) {
        let result = { stat: -2, i: 0, prop: 'n' };
        for (let i = 0; i < 3; i++) {
            let cont = 0;
            let Icont = 0;
            for (let j = 0; j < 3; j++) {
                if (xo[i][j] == this.number) { Icont++; } else if (xo[i][j] == this.enemyNumber) { cont++; }
            };
            if (cont == 2 && Icont == 0) { result.stat = 0; result.i = i; result.prop = 'i'; return result; } else if (cont == 0 && Icont == 2) { result.stat = 1; result.i = i; result.prop = 'i'; return result; }
        }
        for (let i = 0; i < 3; i++) {
            let cont = 0;
            let Icont = 0;
            for (let j = 0; j < 3; j++) {
                if (xo[j][i] == this.number) { Icont++; } else if (xo[j][i] == this.enemyNumber) { cont++; }
            }
            if (cont == 2 && Icont == 0) { result.stat = 0; result.i = i; result.prop = 'j'; return result; } else if (cont == 0 && Icont == 2) { result.stat = 1; result.i = i; result.prop = 'j'; return result; }
        }
        let cont = 0;
        let Icont = 0;
        for (let i = 0; i < 3; i++) {
            if (xo[i][i] == this.number) { Icont++; } else if (xo[i][i] == this.enemyNumber) { ccont++; }
        }
        if (cont == 2 && Icont == 0) { result.stat = 0; result.i = 0; result.prop = 'x'; return result; } else if (cont == 0 && Icont == 2) { result.stat = 1; result.i = 0; result.prop = 'x'; return result; }
        cont = Icont = 0;
        let j = 2;
        for (let i = 0; i < 3; i++) {
            if (xo[i][j] == this.number) { Icont++; } else if (xo[i][j] == this.enemyNumber) { cont++; }
            j--;
        }
        if (cont == 2 && Icont == 0) { result.stat = 0; result.i = 1; result.prop = 'x'; return result; } else if (cont == 0 && Icont == 2) { result.stat = 1; result.i = 1; result.prop = 'x'; return result; }
        result.stat = -1; return result;
        //Robot saw the xo board :)
    }
    veryHard(xo) {
        let first = this.winOrFail(xo);
        if (first.result == true) {
            return { i: first.i, j: first.j };
        }
        if (xo[0][0] != undefined && xo[2][2] == undefined) return { i: 2, j: 2 };
        else if (xo[0][0] == undefined && xo[2][2] != undefined) return { i: 0, j: 0 };
        else if (xo[0][2] != undefined && xo[2][0] == undefined) return { i: 2, j: 0 };
        else if (xo[0][2] == undefined && xo[2][0] != undefined) return { i: 0, j: 0 };
        else if (xo[0][0] == undefined) return { i: 0, j: 0 };
        else if (xo[0][2] == undefined) return { i: 0, j: 2 };
        else if (xo[2][0] == undefined) return { i: 2, j: 0 };
        else if (xo[2][2] == undefined) return { i: 2, j: 2 };
        return this.easy(xo);
    }
    hard(xo) {
        let first = this.winOrFail(xo);
        if (first.result == true) {
            return { i: first.i, j: first.j };
        }
        let i, j;
        if (xo[1][1] == undefined) return { i: 1, j: 1 };
        else if (xo[0][0] == undefined) return { i: 0, j: 0 };
        else if (xo[0][2] == undefined) return { i: 0, j: 2 };
        else if (xo[2][0] == undefined) return { i: 2, j: 0 };
        else if (xo[2][2] == undefined) return { i: 2, j: 2 };
        return this.easy(xo);
    }
    normal(xo) {
        let first = this.winOrFail(xo);
        if (first.result == true) {
            return { i: first.i, j: first.j };
        }
        return this.easy(xo);
    }
    easy(xo) {
        while (true) {
            let i = parseInt(Math.random() * (3));
            let j = parseInt(Math.random() * (3));
            if (xo[i][j] == undefined) {
                return { i: i, j: j };
            }
        }
    }
    winOrFail(xo) {
        //user or I , can we win or fail?
        let status = this.status(xo);
        switch (status.prop) {
            case 'i':
                {
                    for (let i = 0; i < 2; i++) {
                        if (xo[status.i][i] == undefined) {
                            return { result: true, i: status.i, j: i };
                        }
                    }
                }
                break;
            case 'j':
                {
                    for (let i = 0; i < 2; i++) {
                        if (xo[i][status.i] == undefined) {
                            return { result: true, j: status.i, i: i };
                        }
                    }
                }
                break;
            case 'x':
                {
                    if (status.i == 0) {
                        for (let i = 0; i < 2; i++) {
                            if (xo[i][i] == undefined) {
                                return { result: true, i: i, j: i };
                            }
                        }
                    }
                    else {
                        let j = 2;
                        for (let i = 0; i < 2; i++) {
                            if (xo[j - i][i] == undefined) {
                                return { result: true, i: j - i, j: i };
                            }
                        }
                    }
                }
                break;
        }
        return { result: false };
    }
}
module.exports = ai;
//exporting this class with nodejs syntax
