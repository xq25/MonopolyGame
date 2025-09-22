export class Player {
    constructor(nick_name, country_code, color){
        this.nick_name = nick_name;
        this.country = country_code;
        this.color = color;
        this.money = 1500;
        this.active = true;
        this.position = 0;
        this.propierties = [];

    }
    //Accesores y mutadores de la clase.
    getNickName(){
        return this.nick_name;
    }
    setNickName(newNickName){
        this.nick_name = newNickName;
    }

    getCountry(){
        return this.country;
    }
    setCountry(newContry){
        //newCountry tiene que ser el codigo del pais o abreviacion para que toda la logica se maneje igual
        this.country = newContry;
    }

    getColor(){
        return this.color;
    }
    setColor(newColor){
        this.color = newColor;
    }

    getMoney(){
        return this.money;
    }
    setMoney(newMoneyValue){
        //Este metodo lo usaremos mucho para realizar los cambios en este valor al comprar ciertas propiedades
        this.money = newMoneyValue;
    }

    getActiveStatus(){
        return this.active;
    }
    setActiveStatus(newBooleanValue){
        this.active = newBooleanValue;
    }

    getPosition(){
        return this.position;
    }
    setPosition(newPosition){
        this.position = newPosition;
    }   
}
