
/**
* Modal  ver1.2 (alert+content 통합)
* 작성자 : pyeon
* 이중 모달시 const alertModal = new Modal(); 새로 지정필요

* multi : false (defualt)
--remove() 기본 기존모달 무조건 닫힘

* multi : true   -> 이중모달시 기존모달 callBack option에 따라 조절가능
--confirmDoneCallBack, cancelCallBack 없을시 default버튼에  removeMdal() 적용
-- multi:true 여도 callback이 없으면 기본 닫힘
--callBack options 지정시 modal(변수달라질수있음).remove(); 로 해당 모달 제거해줘야함

* option 표 : https://docs.google.com/spreadsheets/d/1zzJNfwIMR7C1XvkGGnyNjaw3u_wrXxCPXGWsk3jLmSM/edit?usp=sharing
*/


/*호출 예시))
const modal = new Modal();
modal.showModal({
    doWhat: 'confirm',
    header: '아이디 찾기',
    title: '선택하신 서비스를<br> 신청하시겠습니까?',
    btn: {                 
        confirm: {
            text: '신청'  -> default : '확인'
        }
    },
    custom : {               
        size : 's/m/l', 
        width :  '00px'        (optional)
    },
    multi : true/false   -> false면 callback에 상관없이  팝업 닫기/확인 버튼 클릭시 기존 modal닫힘
                            true면 callback이 없으면 자동 닫힘, callback있으면 해당callback에서 따로 remove()필요
    confirmDoneCallBack: function () {   (optional) -> 확인버튼 
        modal.showAlertModal({
            doWhat: 'done',
            title: '확인',
            btn: {
                confirm: {
                    text: '신청'
                }
            },
        })
    },
    cancelCallBack: function () {
        console.log('취소')
    }
});
*/




class Modal {
    constructor() {
        this.bg = `<div class="modal-bg"></div>`;
        this.body = document.querySelector('body');
        //this.modal
        //this.options
        // this.multiful
    }

    showModal(options) {
        this.options = options;
        this.#makeDiv();
        this.#makeModal();
        this.#setStyle();
        this.#setClickListener();
    }//showModal


    #makeDiv() {
        const alertModal = document.createElement('div');
        const alertBg = document.createElement('div');
        alertModal.classList.add('modal-wrap');
        alertModal.classList.add(`content-modal`);
        if (!this.options?.content) {
            alertModal.classList.add(`alert-modal`);
        }
        const classNameList = this.options?.className?.split(' ') || [];
        classNameList.forEach(function (item) {
            alertModal.classList.add(item);
        });

        alertBg.classList.add(`content-bg`);
        this.modal = alertModal;
        this.bg = alertBg;

    }

    #makeModal() {
        const optionsTitle = this.options?.title ? `<div class="pop-message">${this.options?.title || ''}</div>` : '';
        const modalHtml = ` <div class="pop-header">${this.options.header || ''}</div>
                            <button class="modal_btn btn-layerPop-close modalCancelIcon_content" type="button" id="">
                                X
                            </button>
                            <div class="layerPop-inner">
                                ${this.optionsTitle}
                                <div class="pop-content">
                                    ${this.options.content || ''}
                                </div>
                                <div class="btn-wrap">
                                    <button class="modal_btn cancel modalCancel_content ${this.options.btn?.cancel?.className || ''}" id=""  style="display:none">${this.options.btn?.cancel?.text || '아니요'}</button>
                                    <button class="modal_btn confirm default btnAlertConfirm_content ${this.options.btn?.confirm?.className || ''}" id=""  style="display:none">${this.options.btn?.confirm?.text || '확인'}</button>
                                    <button class="modal_btn done default modalDone_content ${this.options.btn?.confirm?.className || ''}" id="" style="width:100%; display:none">${this.options.btn?.confirm?.text || '확인'}</button>
                                </div>
                            </div>`
        this.modal.innerHTML = modalHtml;

        this.body.appendChild(this.modal);
        this.body.appendChild(this.bg);
    }

    #setStyle() {
        //사이즈 기본값
        if (this.options?.custom?.size) {
            const sizeObj = {
                s: '390px',
                m: '500px',
                l: '800px'
            }
            this.modal.style.width = sizeObj[`${this.options?.custom?.size || s}`];
        }
        //사이즈 지정값
        if (this.options?.custom?.width) {
            this.modal.style.width = this.options?.custom?.width;
        }

        //multiful 팝업 z-index
        const DEFAULT_BG_ZINDEX = 10;
        const DEFAULT_MODAL_ZINDEX = 11;
        const existingContentModalCnt = document.querySelectorAll('.modal-wrap').length - 1;
        if (existingContentModalCnt > 0) {
            //이중팝업여부
            this.multiful = true;
            //modal
            this.modal.style.zIndex = DEFAULT_MODAL_ZINDEX + (existingContentModalCnt * 2);
            //bg
            this.bg.style.zIndex = DEFAULT_BG_ZINDEX + (existingContentModalCnt * 2);
        }

        //X닫기버튼 옵션
        if (this.options?.btn?.close === false) {
            this.modal.querySelector('.modalCancelIcon_content').style.display = 'none';
        }

        //scrollTop
        this.#getBodyScrollTop();
        this.body.classList.add('not_scroll');

        //doWhat에 따른 button 보이기 (done/confirm)
        const alertPopModal = {
            'confirm': ['.modalCancel_content', '.btnAlertConfirm_content'],
            'done': ['.modalDone_content']
        }
        alertPopModal[this.options.doWhat || 'confirm'].forEach((btnList) => {
            //this.modal 사용을 위해 arrow funs
            this.modal.querySelector(btnList).style.display = 'block';
        });
    }


    #setClickListener() {
        //이중팝업 this.options.multi
        const modalBtnWrap = this.modal.querySelectorAll('button.modal_btn');
        if (this.options.multi) {
            //둘다 없을때 -> 다 막기
            if (!this.options.confirmDoneCallBack && !this.options.cancelCallBack) {
                modalBtnWrap.forEach((buttons) => {
                    buttons.addEventListener('click', () => {
                        this.remove();
                    });
                });
            }
            //confirm만 있을때
            if (this.options.confirmDoneCallBack && !this.options.cancelCallBack) {
                modalBtnWrap.forEach((buttons) => {
                    if (!buttons.className.includes('modalDone_content') && !buttons.className.includes('btnAlertConfirm_content')) {
                        buttons.addEventListener('click', () => {
                            this.remove();
                        });
                    }
                });
            }
            //cancel만 있을때
            if (this.options.cancelCallBack && !this.options.confirmDoneCallBack) {
                modalBtnWrap.forEach((buttons) => {
                    if (!buttons.className.includes('modalCancel_content') && !buttons.className.includes('modalCancelIcon_content')) {
                        buttons.addEventListener('click', () => {
                            this.remove();
                        });
                    }
                });
            }
        } else {
            //이중팝업X  -> 팝업이 자동 remove 후 새 팝업만 뜸
            modalBtnWrap.forEach((buttons) => {
                buttons.addEventListener('click', () => {
                    this.remove();
                });
            });
            this.modal.querySelector('.modalCancelIcon_content').addEventListener('click', () => {
                this.remove();
            });
        }


        //callBack 적용
        const alertBtnWrap = this.modal.querySelector('.layerPop-inner .btn-wrap');
        if (this.options.doWhat === 'confirm') {
            alertBtnWrap.querySelector('.btnAlertConfirm_content').addEventListener('click', this.options.confirmDoneCallBack);
        } else {
            alertBtnWrap.querySelector('.modalDone_content').addEventListener('click', this.options.confirmDoneCallBack);

        }
        if (this.options.cancelCallBack) {
            alertBtnWrap.querySelector('.modalCancel_content').addEventListener('click', this.options.cancelCallBack); //취소/아니요버튼
            this.modal.querySelector('.modalCancelIcon_content').addEventListener('click', this.options.cancelCallBack); //X닫기버튼
        }
    }


    #getBodyScrollTop = () => {
        this.bodyScrollTop = document.scrollingElement.scrollTop;
    }


    remove = () => {
        this.modal.remove();
        this.bg.remove();

        //이중팝업 여부에 따라 body scroll 막기
        this.multiful || this.body.classList.remove('not_scroll');

        //scrollTop
        window.scrollTo(0, this.bodyScrollTop);

    }
} //Modal







