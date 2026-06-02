with open("apps/backend/src/customer/customer.controller.ts", "r") as f:
    content = f.read()

endpoints = """
  @Get('supplier')
  getSupplierProfile(@Req() req: Request & { customerAuth?: CustomerAuthContext }) {
    return this.customerService.getSupplierProfile(req.customerAuth!.clerkUserId);
  }

  @Put('supplier')
  updateSupplierProfile(
    @Req() req: Request & { customerAuth?: CustomerAuthContext },
    @Body() body: Record<string, unknown>,
  ) {
    return this.customerService.updateSupplierProfile(
      req.customerAuth!.clerkUserId,
      body,
    );
  }

  @Get('profiles')"""

content = content.replace("  @Get('profiles')", endpoints)

with open("apps/backend/src/customer/customer.controller.ts", "w") as f:
    f.write(content)
