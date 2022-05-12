/*
Author: Joyce Shendre
Description:  This file consists of functions for importing data of Microsoft Teams Account
and return result
*/
const database = require('../database');
const graphApiAuth = require('./auth.controller');
require('isomorphic-fetch');
const moment = require('moment-timezone');
// Create MySql pool
let connection = database.connection;

module.exports = {
    /* schedule an online meeting with given email id of attendees and preferred time */
    scheduleMeeting: async (req, res) => {
        try {
            graphApiAuth.getAccessToken().then(async (accessToken) => {
                if (accessToken) {
                    const client = getAuthenticatedClient(accessToken);
                    try {
                        const attendee_mail = req.body.attendee_mail;
                        const subject = "Let's go for lunch";
                        const start_date_time = req.body.start_date_time;
                        const end_date_time = req.body.end_date_time;
                        const host_mail = req.body.host_mail;
                        const attendee_name = req.body.attendee_name;
                        const host_name = req.body.host_name;
                        const tempStart_pstDate = moment(start_date_time);
                        tempStart_pstDate.tz('America/Los_Angeles')
                        const tempEnd_pstDate = moment(end_date_time);
                        tempEnd_pstDate.tz('America/Los_Angeles')
                        const start_pstDate = tempStart_pstDate.format().toString();
                        const end_pstDate = tempEnd_pstDate.format().toString();
                        console.log(start_pstDate, end_pstDate)

                        /* Fetches details of user with given host_mail addresss
                            Returns value if present, otherwise return empty array 
                        */
                        const userDetails = await client.api('/users')
                            .header('ConsistencyLevel', 'eventual')
                            .search(`"mail:${host_mail}"`)       //  
                            .get();

                        var userData = userDetails.value;
                        var hostId;
                        console.log('userDetails===>>>', userDetails)

                        if (userData && userData.length > 0) {
                            hostId = userData[0].id;
                            console.log("host id is", hostId);
                            const newevent = {
                                "subject": subject,
                                "body": {
                                    "contentType": "HTML",
                                    // "content": "Does noon work for you?"
                                },
                                "start": {
                                    "dateTime": start_pstDate,
                                    "timeZone": "Pacific Standard Time"
                                },
                                "end": {
                                    "dateTime": end_pstDate,
                                    "timeZone": "Pacific Standard Time"
                                },
                                "attendees": [
                                    {
                                        "emailAddress": {
                                            "address": attendee_mail,
                                            "name": attendee_name
                                        },
                                        "type": "required"
                                    },
                                    {
                                        "emailAddress": {
                                            "address": host_mail,
                                            "name": host_name
                                        },
                                        "type": "required"
                                    }
                                ],
                                "allowNewTimeProposals": true,
                                "isOnlineMeeting": true,
                                "onlineMeetingProvider": "teamsForBusiness",
                                "isOrganizer": false,
                            }
                            console.log(newevent)
                            const eventCreated = await client.api(`users/${hostId}/events`)
                                .post(newevent);

                            if (eventCreated) {
                                // Add the created event in a new table 
                                connection.query(`INSERT INTO scheduled_meetings (meeting_date_time,attendee_mail,host_mail,attendee_name)
                             values (? , ? , ? , ?);`, [start_date_time, attendee_mail, host_mail, attendee_name],
                                    async (err, result) => {
                                        try {
                                            if (err) {
                                                throw err;
                                            } else {
                                                console.log("Meeting Data Stored in Database!")
                                                res.status(201).json({
                                                    message: 'Scheduled meeting successfully'
                                                })
                                            }


                                        } catch (err) {
                                            console.log(err)
                                        }
                                    })
                            }
                            else {
                                res.status(500).json({
                                    error: 'Something went wrong, please try again!'
                                })
                            }

                        }
                        else {
                            console.log('invite')

                            var invitation = {

                                "invitedUserEmailAddress": host_mail, //The email address of the user you are inviting.
                                "invitedUserMessageInfo": {
                                    "messageLanguage": "en-US",
                                    "customizedMessageBody": "Hi, you have just been invited to Microsoft Teams!"
                                },
                                "sendInvitationMessage": true,
                                "inviteRedirectUrl": "https://teams.microsoft.com/" //The URL that the user will be redirected to after redemption
                            }

                            const inviteRes = await client
                                .api('/invitations')
                                .post(invitation);

                            console.log("Invitation sent!" + host_mail)

                            //GET users of Azure Ative Directory
                            if (inviteRes && inviteRes != null) {
                                setTimeout(async () => {

                                    const userDetails = await client.api('/users')
                                        .header('ConsistencyLevel', 'eventual')
                                        .search(`"mail:${host_mail}"`)       //  
                                        .get();

                                    var userData = userDetails.value;
                                    var hostId;
                                    if (userData && userData.length > 0) {
                                        hostId = userData[0].id;
                                        console.log("host id is", hostId);

                                        const newevent = {
                                            "subject": subject,
                                            "body": {
                                                "contentType": "HTML",
                                                // "content": "Does noon work for you?"
                                            },
                                            "start": {
                                                "dateTime": date_time,
                                                "timeZone": "Pacific Standard Time"
                                            },
                                            "end": {
                                                "dateTime": "2022-02-05T14:00:00",
                                                "timeZone": "Pacific Standard Time"
                                            },
                                            // "location":{
                                            //     "displayName":"Harry's Bar"
                                            // },
                                            "attendees": [
                                                {
                                                    "emailAddress": {
                                                        "address": attendee_mail,
                                                        "name": attendee_name
                                                    },
                                                    "type": "required"
                                                },
                                            ],
                                            "allowNewTimeProposals": true,
                                            "isOnlineMeeting": true,
                                            "onlineMeetingProvider": "teamsForBusiness"
                                        }


                                        const eventCreated = await client.api(`users/${hostId}/events`)
                                            .post(newevent);
                                        if (eventCreated) {

                                            // Add the created event in a new table 
                                            connection.query(`INSERT INTO scheduled_meetings (meeting_date_time,attendee_mail,host_mail,attendee_name)
                                             values (? , ? , ? , ?);`, [date_time, attendee_mail, host_mail, attendee_name],
                                                async (err, result) => {
                                                    try {
                                                        if (err) {
                                                            throw err;
                                                        } else {
                                                            console.log("Meeting Data Stored in Database!")
                                                            res.status(201).json({
                                                                message: 'Scheduled meeting successfully'
                                                            })
                                                        }


                                                    } catch (err) {
                                                        console.log(err)
                                                    }
                                                })
                                        }

                                    } else {
                                        res.status(500).json({
                                            error: 'Something went wrong, please try again!'
                                        })
                                    }

                                }, 7000)

                            }
                        }

                    } catch (error) {
                        console.log(error)
                    }
                }
            })

        } catch (exception) {
            console.log(exception)
        }

    },
}