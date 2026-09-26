export const verifyPincode = async (pincode) => {
    const cleanPincode = String(pincode).trim();
  
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        valid: false,
        message: "Pincode must be exactly 6 digits.",
      };
    }
  
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${cleanPincode}`
      );
  
      if (!response.ok) {
        throw new Error("Pincode service unavailable");
      }
  
      const data = await response.json();
  
      const result = data?.[0];
  
      if (
        !result ||
        result.Status !== "Success" ||
        !result.PostOffice ||
        result.PostOffice.length === 0
      ) {
        return {
          valid: false,
          message: "Please enter a valid Indian pincode.",
        };
      }
  
      const postOffice = result.PostOffice[0];
  
      return {
        valid: true,
        message: "Pincode verified.",
        city:
          postOffice.District ||
          postOffice.Block ||
          "",
        state: postOffice.State || "",
        postOffice: postOffice.Name || "",
      };
    } catch (error) {
      console.error(
        "Pincode verification error:",
        error
      );
  
      return {
        valid: false,
        message:
          "Unable to verify pincode right now. Please try again.",
      };
    }
  };