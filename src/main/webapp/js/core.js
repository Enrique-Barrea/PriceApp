    const APP_NAME = "retroPFG";
    const APP_URL = "/"+APP_NAME;
    //PRODUCTION ENVIRONMENT
     const URLBACKEND = "http://localhost:8080"+APP_URL+"/";

    let userLogged;
    let isCambiosRealizados;
    let rol = 'all';


    $(document).ready(function () {
        let urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('user')) {
            login(urlParams.get('user'), urlParams.get('password'))
        } else {
            let userJson = localStorage.getItem(APP_NAME+"usuario");
            if (
                userJson === null &&
                window.location.href.toLowerCase().indexOf("login.") === -1) {
                location.href = "login.html";
            }

            if (userJson) {
                try {
                    userLogged = JSON.parse(userJson)
                    usuarioLogueado = userLogged.UMT_Id;
                    $("#section_sidebar").load(APP_URL + "/components/menu.html", function () {
                      initMenu();
                    });

                    $("#section_footer").load(APP_URL + "/components/footer.html");
                }
                catch {
                    logout();
                    //localStorage.clear();
                    //location.href = "login.html";
                }
            }

            // Poner texto sidebar de color
            let paramCss = "menu_color";
            var cssFile = localStorage.getItem(APP_NAME+paramCss);
            if (cssFile)
            {
                setCssFile(cssFile);
            } else {
                getConfigurationParam(paramCss).then(result => {
                    cssFile = result[paramCss];
                    localStorage.setItem(APP_NAME+paramCss, cssFile);
                    setCssFile(cssFile);
                });
            }
        }
    });

    function formatDate(date, separator = '-') {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join(separator);
    }

    var AesUtil = function(keySize, iterationCount) {
        this.keySize = keySize / 32;
        this.iterationCount = iterationCount;
    };

    AesUtil.prototype.generateKey = function(salt, passPhrase) {
        var key = CryptoJS.PBKDF2(
            passPhrase,
            CryptoJS.enc.Hex.parse(salt),
            { keySize: this.keySize, iterations: this.iterationCount });
        return key;
    }

    AesUtil.prototype.encrypt = function(salt, iv, passPhrase, plainText) {
        var key = this.generateKey(salt, passPhrase);
        var encrypted = CryptoJS.AES.encrypt(
            plainText,
            key,
            { iv: CryptoJS.enc.Hex.parse(iv) });
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    }

    AesUtil.prototype.decrypt = function(salt, iv, passPhrase, cipherText) {
        var key = this.generateKey(salt, pautssPhrase);
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(cipherText)
        });
        var decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            key,
            { iv: CryptoJS.enc.Hex.parse(iv) });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    const encryptPassword = password => {
        var iv = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
        var salt = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);

        var aesUtil = new AesUtil(128, 1000);
        var ciphertext = aesUtil.encrypt(salt, iv, '1234567891234567', password);
        var aesPassword = (iv + "::" + salt + "::" + ciphertext);

        return btoa(aesPassword);
    }

    function login(username, password) {
        var usuario = (username == null || username == '') ? $('#user').val() : username;
        var password = (password == null || password == '') ? encryptPassword($('#password').val()).toString() : password;

        $.post({ url: URLBACKEND + "login_app?username=" + usuario + "&password=" + password })
            .then(function (data) {
                //TODO guardar el JWT en el localstorage y luego redireccionar
                let userJson = {};
                userJson.Profiles = [];
                userJson.CFG_SendEmail = data[0].CFG_SendEmail;
                userJson.UMT_Id = data[0].UMT_Id;
                userJson.UMT_Mail = data[0].UMT_Mail;
                data.map(itm => { userJson.Profiles.push(itm.UMT_TipoUserId) })
                localStorage.setItem(APP_NAME+"usuario", JSON.stringify(userJson))
                location.href = "reports.html#all";
            }).catch(function (e) {
                if (e.status === 401) {
                    getAlertMessage("INCORRECT_LOGIN_WAR")
                }
                else
                    alert("Ocurrio un error al consultar contra la api")
            });
        }

        function logout() {
            getAlertMessage("LOGOUT_WAR", function(willDelete) {
                if (willDelete) {
                    for (var i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if(key.toLowerCase().indexOf(APP_NAME) >= 0) {
                        localStorage.removeItem(key);
                        }
                    }
                    location.href = "login.html";
                }
            });
        }

        async function loadDropDown(target, endpoint, valuefield, textfield, showSelectAnOption,withSelected = false, capitalize = false) {
                    try {
                        target.empty();
                        var data = await $.get({
                            url: URLBACKEND + endpoint,
                            type: 'Get'//,
                            //timeout: 500
                        });
                        var result = data;
                        if (showSelectAnOption == null || showSelectAnOption == true)
                            target.append('<option value="">select an option</option>');
                        result.forEach(item => {

                            if (capitalize) {
                                item[valuefield] = item[valuefield] ?
                                    item[valuefield].toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, function(letter) {
                                        return letter.toUpperCase();
                                    }) : '';
                            }

                            generateOption(withSelected, item.selected, eval("item." + valuefield), eval("item." + textfield), target);
                        })
                        target.prop('disabled', false);
                    }
                    catch (e) {
                        target.prop('disabled', true);
                        target.append('<option>Error loading select options</option>');
                        console.log(e)
                    }
        }

        var getUrlParameter = function getUrlParameter(sParam) {
            var sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
                }
            }
            return false;
        };

        function generateOption(withSelected, selected, valuefield, textfield, target) {
            if(withSelected){
                if(selected == 0)
                    target.append('<option value="' + valuefield + '">' + textfield + '</option>');
                else
                    target.append('<option value="' + valuefield + '" selected>' + textfield + '</option>');
            } else
                target.append('<option value="' + valuefield + '">' + textfield + '</option>');
        }

        async function grabarHeaderUniverseEnLocalStorage(idUniverso) {
            await $.get(URLBACKEND + "/universe/" + idUniverso)
                .then(datos => {
                    localStorage.setItem(APP_NAME+"universe_header", JSON.stringify(datos))
                });
        }

        function tableToJson() {
            var myRows = [];
            var $headers = $("th");
            var $rows = $("tbody tr").each(function (index) {
                $cells = $(this).find("td");
                myRows[index] = {};
                $cells.each(function (cellIndex) {
                    let nombreColumna = $($headers[cellIndex]).attr("name") == null ? $($headers[cellIndex]).attr("data-field") : $($headers[cellIndex]).attr("name");

                    if ($(this)[0].childElementCount == 0) {
                        if ($(this).html() == "undefined" || $(this).html() == "null")
                            myRows[index][nombreColumna] = null;
                        else
                            myRows[index][nombreColumna] = $(this).html();
                    }
                    else {
                        if ($(this)[0].children.length == 1 && $(this)[0].children[0].tagName == "SMALL")
                            myRows[index][nombreColumna] = $(this)[0].children[0].innerText
                        else {
                            let inputValue = $(this)[0].getElementsByTagName("input").length > 0 && $(this)[0].getElementsByTagName("input")[0].type == "text" ? $(this)[0].getElementsByTagName("input")[0].value : null;
                            let checkValue = $(this)[0].getElementsByTagName("input").length > 0 && $(this)[0].getElementsByTagName("input")[0].type == "checkbox" ? $(this)[0].getElementsByTagName("input")[0].checked : null;
                            let smallValue = $(this)[0].getElementsByTagName("small").length > 0 ? $(this)[0].getElementsByTagName("small")[1] : null;

                            if (checkValue != null)
                                myRows[index][nombreColumna] = checkValue
                            else if (inputValue == null)
                                if (smallValue != null) {
                                    myRows[index][nombreColumna] = smallValue.innerText
                                }else{
                                    myRows[index][nombreColumna] = $(this)[0].children[0].value
                                }
                            else
                                myRows[index][nombreColumna] = inputValue;
                        }
                    }
                });
            });

            // Let's put this in the object like you want and convert to JSON (Note: jQuery will also do this for you on the Ajax request)
            var myObj = {};
            myObj.myrows = myRows;
            return myObj;
        }

        const isDecimalKey = (event, input) => {
            const patt = /^\d+\.{0,1}\d{0,2}$/;
            if (event.key == ".") {
                if (input.value.indexOf(".") > 0) {
                    event.preventDefault();
                }
            }
            else {
                if (!patt.test(event.key)) {
                    event.preventDefault();
                    return;
                }
            }
        }

    const formatNumber = number => number
        ? number.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.').split('').reverse().join('').replace(/^[\.]/,'')
        : 0;

    function sendMail(idMensaje, PPCH_Id) {
        $.post(URLBACKEND + "email/send", "idMensaje="+idMensaje+"&PPCH_Id=" + PPCH_Id+"&UMT_Id="+userLogged.UMT_Id)
    }

    function infoApp() {
        let content = "";
        $.get({
            url: URLBACKEND + "utils/info_mosaictool?UMT_Id="+userLogged.UMT_Id,
            type: 'Get'
        }).then(data => {
            content += data.version + "\n";
            content += data.environment + "\n";
            content += data.userInfo.replaceAll("\\n","\n") + "\n";
            swal("INFO MOSAICTOOL", content);
        });
    }

    function getAlertMessage(idMensaje, funcion, cont, funcion2) {
            $.get({
                    url: URLBACKEND + "utils/configurationAlertMessage?idMensaje="+idMensaje,
                    type: 'Get'//,
                    //timeout: 1000
                })
                    .then(tableData => {
                        tableData[0].body = tableData[0].body ? tableData[0].body.replace("\\n","\n") : '';
                        console.log(tableData[0].body);
                        let swaltext
                        switch(tableData[0].type) {
                        case 'Simple':  //OK
                            swal(tableData[0].title, tableData[0].body, tableData[0].icon)
                            return
                        case 'ErrorText':   //OK
                            swaltext = tableData[0].body + '\n' + cont;
                            swal(tableData[0].title, swaltext, tableData[0].icon)
                            return
                        case 'ErrorTextThen':   //FALTA TEST
                            swaltext = tableData[0].body + '\n' + cont;
                            swal(tableData[0].title, swaltext, tableData[0].icon)
                            .then((result) => {
                                   funcion();
                            })
                            return
                        case 'Then':    //OK
                            swal(tableData[0].title, tableData[0].body, tableData[0].icon)
                            .then((result) => {
                                   funcion();
                            })
                            return
                        case 'Confirm': //OK
                            swal(tableData[0].title, tableData[0].body, tableData[0].icon)
                            .then((result) => {
                                if (result) {
                                   funcion();
                                }
                            })
                            return
                        case 'ConfirmNotConfirm':   //NO SE UTILIZA
                            swal(tableData[0].title, tableData[0].body, tableData[0].icon)
                            .then((result) => {
                                if (result) {
                                   funcion();
                                }
                                else funcion2();
                            })
                        case 'Buttons': //OK
                            let dngMode
                            if(tableData[0].dangerMode == 1) dngMode = true;
                            else dngMode = false;
                            swal({
                                title: tableData[0].title,
                                text: tableData[0].body,
                                icon: tableData[0].icon,
                                dangerMode: dngMode,
                                buttons: [
                                    tableData[0].button1,
                                    tableData[0].button2
                                ]
                              }).then((result) => {
                                    funcion(result);
                              })
                              return
                        case 'Form':
                            swal({
                                title: tableData[0].title,
                                content: cont,
                                icon: tableData[0].icon,
                            })
                            return
                        case 'Input':   //OK
                            swal({
                                title: tableData[0].title,
                                content: cont,
                                icon: tableData[0].icon,
                                dangerMode: true,
                                buttons: [
                                    tableData[0].button1,
                                    tableData[0].button2
                                ],
                            }).then((result) => {
                               if (result) {
                                  funcion(result);
                               }
                            });
                        }
                    })
    }

    async function unsavedRedirect(objectAction, type) {
        if(isCambiosRealizados) {
            if(type === 'redirect' && objectAction.includes("#")) return;
            event.preventDefault();
            getAlertMessage("UNSAVED_CHANGES_WAR", function (isConfirm) {
                if (isConfirm) {
                    isCambiosRealizados = false;
                    switch (type) {
                        case 'redirect':
                            window.location.href = objectAction;
                            break;
                        case 'table':
                            var $table = $(objectAction).bootstrapTable();
                            $table.bootstrapTable('refresh');
                            break;
                        case 'function':
                            objectAction();
                            break;
                    }
                }
            });
        }
        else if (type === 'function') {
            objectAction();
        }
        else if (type === 'table') {
            var $table = $(objectAction).bootstrapTable();
            $table.bootstrapTable('refresh');
        }
    }

    async function getConfigurationParam(param) {
        return $.get(URLBACKEND + "utils/configuration/"+param)
    }


    function setCssFile(cssFile) {
        if(cssFile && cssFile !== 'default') {
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = 'styles/sidebar-'+cssFile+'.css';
            head.appendChild(link);
        }
    }

    async function initMenu() {
        try {
            const response = await fetch(URLBACKEND + "utils/getMenu?UMT_Id=" + userLogged.UMT_Id);
            let data = await response.json();

            // Ordenamos los datos por el atributo OrderMenu
            data = data.sort((a, b) => a.OrderMenu - b.OrderMenu);

            const menu = document.getElementById("menu");

            data.forEach(menuItem => {
                if (menuItem.ParentId == null) { // Si es un menú padre
                    const menuElement = createMenuElement(menuItem, data);
                    menu.appendChild(menuElement);
                }
            });
        } catch (error) {
            console.error('Error initializing menu:', error);
        }
    }

    function createMenuElement(menuItem, allMenus) {
        const li = document.createElement("li");
        const a = document.createElement("a");

        if (menuItem.Url) {
            a.setAttribute("href", menuItem.Url);
        } else {
            a.setAttribute("href", "#homeSubmenu" + menuItem.Id);
            a.setAttribute("data-toggle", "collapse");
            a.setAttribute("aria-expanded", "true");
            a.classList.add("dropdown-toggle");
        }

        const childMenus = allMenus.filter(menu => menu.ParentId === menuItem.Id);
        if (childMenus.length > 0) {
            // Si el menú tiene hijos, añadimos un icono
            const icon = document.createElement("i");
            icon.className = menuItem.Icon;
            a.appendChild(icon);
        }

        a.appendChild(document.createTextNode(menuItem.Name));
        li.appendChild(a);

        if (childMenus.length > 0) {
            // Ordenamos los submenús por el atributo OrderMenu
            const sortedChildMenus = childMenus.sort((a, b) => a.OrderMenu - b.OrderMenu);

            const ul = document.createElement("ul");
            ul.className = "collapse list-unstyled show";
            ul.setAttribute("id", "homeSubmenu" + menuItem.Id);

            sortedChildMenus.forEach(childMenu => {
                const childElement = createMenuElement(childMenu, allMenus);
                ul.appendChild(childElement);
            });

            li.appendChild(ul);
        }

        return li;
    }