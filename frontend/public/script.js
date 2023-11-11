console.log("Running code");

const backendUrl = 'http://localhost:3000';
const transactionDataPath = '/adm/data';

window.onload = getTransactionData();

async function getTransactionData() {

    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    }
    let response;

    fetch('http://localhost:3000/adm/data', {
        method: 'GET'
    })
        .then(res => {
            if(res.ok){
                console.log('Recieved Data sucessfully');
            }
            else {
                console.error('Error while reciving the Data')
            }

            return res.json();
        })
        .then(data => {

            const tableBody = document.getElementById('tableBody');

            data.forEach(elem => {
                
                const MessageTypeId = elem.Timestamp;
                const UniqueId = elem.UniqueId;
                const Action = elem.Action;
                let Payload;
                console.log(elem);
                if(elem.Payload == undefined){
                    Payload = "-"
                }
                else {
                    
                    switch(Action){

                        case 'BootNotification': 
                            const model = elem.Payload.chargePointModel;
                            Payload = (model + " (Model)");
                            break;

                        case 'StartTransaction':
                            const meterStart = elem.Payload.meterStart;
                            Payload = (meterStart + " (meterStart)");
                            break;

                        case 'StopTransaction':
                            const meterStop = elem.Payload.meterStop;
                            Payload = (meterStop + " (meterStop)");
                            break;

                        case 'Authorize':
                            const id = elem.Payload.idTag;
                            Payload = (id + " (ID)")


                    }

                }

                const content = document.createElement('div');
                content.classList.add('tableLine')
                    const timeStamp = document.createElement('div');
                    timeStamp.classList.add('recTimestamp')
                        const pTimeStamp = document.createElement('p');
                        const textPTimeStamp = document.createTextNode(MessageTypeId)
                        pTimeStamp.appendChild(textPTimeStamp);
                    timeStamp.appendChild(pTimeStamp);
                content.appendChild(timeStamp);
                    const recMsg = document.createElement('div');
                    recMsg.classList.add('recMsg')
                        const pRecMsg = document.createElement('p');
                        const textPRecMsg = document.createTextNode(Action)
                        pRecMsg.appendChild(textPRecMsg);
                    recMsg.appendChild(pRecMsg);
                content.appendChild(recMsg);
                    const recMeter = document.createElement('div');
                    recMeter.classList.add('recMsg')
                        const pRecMeter = document.createElement('p');
                        const textPRecMeter = document.createTextNode(Payload)
                        pRecMeter.appendChild(textPRecMeter);
                        recMeter.appendChild(pRecMeter);
                content.appendChild(recMeter);

                tableBody.appendChild(content);

            });

        })
}