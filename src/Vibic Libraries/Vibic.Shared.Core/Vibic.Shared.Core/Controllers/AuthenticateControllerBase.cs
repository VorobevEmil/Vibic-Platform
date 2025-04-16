using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Vibic.Shared.Core.Controllers;

[ApiController]
[Authorize]
public class AuthenticateControllerBase : ControllerBase
{
    
}