module.exports=`
<div>
Hi, <% user.name %> , Please confirm your email ,click the link below <a href="<%= verificationLink %>" > click here </a>.
or copy paste from here: http://<%= verificationLink %>
</div>
`