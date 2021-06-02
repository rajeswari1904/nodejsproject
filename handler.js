'use strict';
const axios = require('axios');
module.exports.createOrder = async (event) => {
   try {
      var locusData = getCovertJson(event);
      const response = await doRequest(locusData);
      console.info("Create Order  Success");
      return response;
   }
   catch (error) {
      console.info("Create Order Faild");
      var count = 0;
      var maxTries = 3;
      while (count < 3) {
         console.log("loop")
         console.info(count);
         try {
            var locusData = getCovertJson(event);
            const response = await doRequest(locusData);
            return response;

         } catch (err) {
            count = count + 1;
            if (count == maxTries) {
              /* var statuscode = (err.status) ? err.status : 400;
               var statusError = (err.error) ? err.error : err.message;*/
               return ({ statusCode: err.response.status, body: JSON.stringify(err.response.data) });

            }
         }
      }
   }

}

function getCovertJson(event) {
   try {
      var locusData = {};
      var lineItems = [];
      var skills = [];
      var pickupSlots = [];
      var teamId = null;
      var scanId = null;
      var dropVisitName = null;
      var dropTransactionDuration =(20 * 60);
      var customProperties = {}
      var pickupLatLng = null;
      var pickupSlot = {};
      var pickupLocationAddress = {};
      var pickupContactPoint = {};
      var dropLocationAddress = {};
      var dropContactPoint = {};
      var dropLatLng = {};
      var dropSlot = {};
      var dropSlots = [];
      const eventreq = JSON.parse(event.body);

      /** making customProperties Details */
      eventreq.data.custom_fields_listing.forEach(res => {
         customProperties[res.name] = res.value;
         if (res.name == 'Skills') {
            var str = res.value;
            skills = str.split(",");
         }
         if (res.name == 'Team ID') {
            teamId = res.value;
         }
         if (res.name == 'Scan ID') {
            scanId = res.value;
         }
         if (res.name == 'Drop Transaction Duration (mins)') {
            dropTransactionDuration = (res.value * 60);
         }

      });

      /** making lineItems Details */

      eventreq.data.order_items.forEach(res => {
         var price = {};
         price.amount = res.price,
            price.currency = eventreq.data.currency;
         price.symbol = eventreq.data.currency;
         var parts = []
         lineItems.push({
            note: res.note,
            name: res.name,
            id: res.sku,
            lineItemId: res.item_id,
            quantity: res.quantity_ordered,
            quantityUnit: "PC",
            price: price,
            parts: parts

         });
      });
      /*var billres = (eventreq.data.billing_address)?eventreq.data.billing_address:null;
      if(billres){
         pickupContactPoint.name = billres.name;
         pickupContactPoint.number = "";
         pickupLocationAddress.id = null;
         pickupLocationAddress.placeName = billres.company;
         pickupLocationAddress.localityName = billres.address2;
      pickupLocationAddress.formattedAddress = billres.address1;
      pickupLocationAddress.subLocalityName = null;
      pickupLocationAddress.pincode = billres.zipcode
      pickupLocationAddress.city = billres.country;
      pickupLocationAddress.state = billres.state;
      pickupLocationAddress.countryCode = null;
      pickupLocationAddress.countryCode= billres.country_code,
      pickupLocationAddress.locationType=null,
      pickupLocationAddress.placeHash= null
      }*/
      /** making DropAddress and DropcontactPoint Details */
      var shipres = (eventreq.data.shipping_address) ? eventreq.data.shipping_address : null;
      if (shipres) {
         dropVisitName = shipres.name
         dropContactPoint.name = shipres.name;
         dropContactPoint.number = shipres.contact_number;
         dropLocationAddress.id = null,
            dropLocationAddress.placeName = shipres.company,
            dropLocationAddress.localityName = shipres.address2,
            dropLocationAddress.formattedAddress = shipres.address1,
            dropLocationAddress.subLocalityName = null,
            dropLocationAddress.pincode = shipres.zipcode,
            dropLocationAddress.city = shipres.country,
            dropLocationAddress.state = shipres.state,
            dropLocationAddress.countryCode = shipres.country_code
         dropLocationAddress.locationType = null,
            dropLocationAddress.placeHash = null
      }
      /* **Start Convertion here ** */
      locusData.clientId = "arki-devo";
      locusData.id = eventreq.data.id;
      locusData.name = eventreq.data.channel_order_number;
      locusData.code = eventreq.data.channel_order_id;
      //locusData.status = eventreq.data.order_status;
      locusData.status = "ACTIVE";
      locusData.version = 1;
      locusData.customProperties = customProperties;
      locusData.auditMetadata = null;
      locusData.teamId = teamId;
      locusData.lineItems = lineItems;
      locusData.skills = skills;
      locusData.temperatureThreshold = null;
      locusData.customFields = null;
      locusData.shiftId = null;
      locusData.scanId = scanId;
      locusData.pickupContactPoint = null;
      locusData.pickupLocationAddress = null;
      locusData.pickupLatLng = pickupLatLng;
      locusData.pickupDate = null;
      locusData.pickupSlot = pickupSlot;
      locusData.pickupSlots = pickupSlots;
      locusData.pickupTransactionDuration = null;
      locusData.pickupAmount = null;
      locusData.pickupAppFields = null;
      locusData.pickupCustomerId = null;
      locusData.pickupAddressId = null;
      locusData.pickupVisitName = eventreq.data.warehouse_id;
      locusData.pickupLocationId = eventreq.data.warehouse_id;
      //Drop Address
      locusData.dropVisitName = dropVisitName;
      locusData.dropLocationId = null;
      locusData.dropContactPoint = dropContactPoint;
      locusData.dropLocationAddress = dropLocationAddress;
      var dropdate = new Date(eventreq.data.delivery_date).toISOString().split('T');
      locusData.dropLatLng = dropLatLng;
      locusData.dropDate = dropdate[0];
      dropSlot.start = new Date(eventreq.data.shipping_due_date).toISOString();
      dropSlot.end = new Date(eventreq.data.delivery_date).toISOString();
      locusData.dropSlot = dropSlot;
      locusData.dropSlots = dropSlots;
      locusData.dropTransactionDuration = dropTransactionDuration;
      /* Making Amount Detils Json*/
      var amount = {};
      amount.amount = eventreq.data.total;
      amount.currency = eventreq.data.currency;
      amount.symbol = eventreq.data.currency;
      var dropAmount = {
         amount: amount,
         exchangeType: "NONE"
      };
      locusData.dropAmount = dropAmount;
      locusData.dropAppFields = null;
      locusData.dropCustomerId = null;
      locusData.dropAddressId = null;
      var volume = null;
      /* volume.value = "0";
       volume.unit = "CM";*/
      locusData.volume = (volume) ? volume : null;
      var weight = null;

      /*weight.value=eventreq.data.weight,
      weight.unit= "KG"*/
      locusData.weight = (weight) ? weight : null;
      locusData.orderedOn = null;
      locusData.createdOn = null;
      locusData.sourceOrderId = 0;
      locusData.taksType = null;
      locusData.batchType = null;
      locusData.batchId = null;
      locusData.planId = null;
      locusData.tourId = null;
      locusData.sequence = null;
      locusData.userId = null;
      locusData.homebaseId = eventreq.data.warehouse_id;
      locusData.orderStatus = "QUOTE_REQUESTED";
      locusData.effectiveStatus = "PLANNING";
      locusData.usecase = null;
      console.info("Convertion Create Order");
      console.info(JSON.stringify(locusData));// console.log(locusData)
      return locusData;
   }
   catch (err) {
      console.error(err)
   }
}

function doRequest(locusData) {
   try {
      var data = locusData;
      const clientId = data.clientId;
      const id = data.id;
      const username = 'arki-devo'
      const password = '167eb8d0-aab4-44e0-99c4-0469945d2bae'
      const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
      const url = 'https://oms.locus-api.com/v1/client/' + clientId + '/order/' + id + '?overwrite=true'
      const response = new Promise((resolve, reject) => {
         axios.put(url, locusData, {

            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Basic ${token}`
            }
         }).then((res) => {
            console.info("Locus URl Success");
            resolve({
               statusCode: 200,
               body: JSON.stringify(res.data)
            });
         })
            .catch((error) => {
               console.info("Locus URl Error");
               console.log(error);
               reject(error);
            });
      })
      return response;
   }
   catch (error) {
      console.error(error);
      console.error("doRequest Catch Handling");

   }

}





