## generating keystore

Details entered as follows:
```
➜  hustle git:(master) ✗ keytool -genkey -alias Hustle -keyalg RSA -keysize 2048 -validity 10000
Enter keystore password:  
Re-enter new password: 
What is your first and last name?
  [Unknown]:  saikat chakrabortty
What is the name of your organizational unit?
  [Unknown]:  Hustle
What is the name of your organization?
  [Unknown]:  Blockcluster
What is the name of your City or Locality?
  [Unknown]:  Kolkata
What is the name of your State or Province?
  [Unknown]:  WB
What is the two-letter country code for this unit?
  [Unknown]:  IN
Is CN=saikat chakrabortty, OU=Hustle, O=Blockcluster, L=Kolkata, ST=WB, C=IN correct?
  [no]:  yes

```


which generated `.keystore` file now its named as `.keystore.old`
by using :
```keytool -importkeystore -srckeystore /home/astra/.keystore -destkeystore /home/astra/.keystore -deststoretype pkcs12
```

`.keystore` to Non JKS/JCEKS. The JKS keystore is backed up as `.keystore.old`.
