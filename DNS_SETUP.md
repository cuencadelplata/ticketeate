# Custom Domain Setup Instructions

## Status: ✅ COMPLETE (AWS side)

### What's Done:
1. ✅ SSL Certificate issued for `ticketeate.com.ar` and `www.ticketeate.com.ar`
2. ✅ Custom domain created in API Gateway
3. ✅ API mapping configured (production stage)

### What You Need to Do: DNS Configuration

You need to add a CNAME record in your domain registrar (DNS provider).

**DNS Record to Add:**

| Type | Name | Target |
|------|------|--------|
| CNAME | ticketeate.com.ar | d-spqimywee4.execute-api.us-east-2.amazonaws.com |
| CNAME | www.ticketeate.com.ar | d-spqimywee4.execute-api.us-east-2.amazonaws.com |

### Steps:

1. **Go to your domain registrar** (wherever you bought ticketeate.com.ar)
   - Examples: GoDaddy, Namecheap, Route53, CloudFlare, etc.

2. **Add CNAME records:**
   - Host: `ticketeate.com.ar`
   - Points to: `d-spqimywee4.execute-api.us-east-2.amazonaws.com`
   
   - Host: `www.ticketeate.com.ar`
   - Points to: `d-spqimywee4.execute-api.us-east-2.amazonaws.com`

3. **Wait for DNS propagation** (usually 5-30 minutes)

4. **Test after DNS propagates:**

```bash
# Test the custom domain
curl -X GET https://ticketeate.com.ar/production/api/events/all -H "Origin: https://ticketeate.com.ar"

# Should return the same response as:
curl -X GET https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/events/all
```

### After DNS is Updated:

Update your frontend config to use the custom domain:

**apps/next-frontend/.env or Vercel environment:**
```
NEXT_PUBLIC_API_URL=https://ticketeate.com.ar/production
```

Instead of:
```
NEXT_PUBLIC_API_URL=https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production
```

### Verification:

Once DNS is configured, you can verify with:

```bash
# Test public endpoint (no auth needed)
curl https://ticketeate.com.ar/production/api/events/all

# Test protected endpoint (needs auth cookie)
curl https://ticketeate.com.ar/production/api/events \
  -H "Cookie: better_auth_session=YOUR_TOKEN" \
  -H "Origin: https://ticketeate.com.ar"
```

### AWS Configuration Details:

**Domain Name Configuration:**
- Domain: `ticketeate.com.ar`
- Certificate: `arn:aws:acm:us-east-2:665352994810:certificate/42a4f467-009c-45b3-8ec2-9be9d6b85b86`
- Target: `d-spqimywee4.execute-api.us-east-2.amazonaws.com`
- Hosted Zone ID: `ZOJJZC49E0EPZ`
- Status: AVAILABLE

**API Mapping:**
- API ID: `j5d9mwvxgh`
- Domain: `ticketeate.com.ar`
- Stage: `production`
- Mapping ID: `ptrto8`

---

**Note:** Once DNS is configured, both URLs will work:
- `https://ticketeate.com.ar/production/api/...` ✅ Custom domain
- `https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/...` ✅ Original URL (still works)

**Next Step:** Update frontend `NEXT_PUBLIC_API_URL` environment variable after DNS is propagated.
