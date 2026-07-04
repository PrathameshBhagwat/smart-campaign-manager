import re

class BusinessRules:
    @staticmethod
    def validate(content: str, business_type: str) -> str:
        if not content:
            return content
            
        if not business_type:
            business_type = "education"
            
        lower_content = content.lower()
        
        if business_type == "finance":
            return BusinessRules.validate_finance(content, lower_content)
        elif business_type == "education":
            return BusinessRules.validate_education(content, lower_content)
        elif business_type == "recruitment":
            return BusinessRules.validate_recruitment(content, lower_content)
        elif business_type == "real_estate":
            return BusinessRules.validate_real_estate(content, lower_content)
            
        return content

    @staticmethod
    def validate_finance(content: str, lower_content: str) -> str:
        banned = ["guaranteed profit", "guaranteed profits", "100% returns", "risk free", "double your money", "guaranteed return"]
        for b in banned:
            if b in lower_content:
                raise ValueError(f"Output violates finance compliance rules: Contains banned phrase '{b}'")
        return content

    @staticmethod
    def validate_education(content: str, lower_content: str) -> str:
        banned = ["100% placement", "guaranteed salary", "job confirmed"]
        for b in banned:
            if b in lower_content:
                raise ValueError(f"Output violates education compliance rules: Contains banned phrase '{b}'")
        return content

    @staticmethod
    def validate_recruitment(content: str, lower_content: str) -> str:
        banned = ["guaranteed job", "selected candidate", "confirmed placement"]
        for b in banned:
            if b in lower_content:
                raise ValueError(f"Output violates recruitment compliance rules: Contains banned phrase '{b}'")
        return content

    @staticmethod
    def validate_real_estate(content: str, lower_content: str) -> str:
        banned = ["guaranteed appreciation", "risk-free investment"]
        for b in banned:
            if b in lower_content:
                raise ValueError(f"Output violates real estate compliance rules: Contains banned phrase '{b}'")
        return content
