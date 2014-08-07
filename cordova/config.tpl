<?xml version='1.0' encoding='utf-8'?>
<widget id="com.kiipost.app{{#env}}-{{env}}{{/env}}" version="{{version}}" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>Kiipost</name>
    <description>
        Kiipost - stay in the know.
    </description>
    <author email="oleg@kiipost.com" href="http://kiipost.com">
       Oleg Slobodskoi and kiipost team.
    </author>
    <content src="index.html" />
    <access origin="*" />
    <!--KeyboardDisplayRequiresUserAction (boolean, defaults to true): Set to false to allow the keyboard to appear when calling focus() on form inputs. -->
    <preference name="KeyboardDisplayRequiresUserAction" value="false"/>
    <icon src="/icons/152x152{{#env}}-{{env}}{{/env}}.png"/>
    <preference name="AutoHideSplashScreen" value="false" />
</widget>
