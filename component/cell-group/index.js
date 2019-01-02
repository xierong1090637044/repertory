Component({
    externalClasses: ['i-class'],

    relations: {
        '../cell/index': {
            type: 'child',
            linked () {
                this._updateIsLastCell();
            },
            linkChanged () {
                this._updateIsLastCell();
            },
            unlinked () {
                this._updateIsLastCell();
            }
        }
    },

    methods: {
        _updateIsLastCell() {
            let cells = this.getRelationNodes('../cell/index');
            const len = cells.length;

            if (len > 0) {
                let lastIndex = len - 1;

                cells.forEach((cell, index) => {
                    cell.updateIsLastCell(index === lastIndex);
                });
            }
        },

      loadmore: function () {
        var myEventDetail = {} // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        this.triggerEvent('myevent', myEventDetail, myEventOption)
      }
    }
});
