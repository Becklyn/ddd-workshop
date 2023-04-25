import { CqrsModule } from "@nestjs/cqrs";
import { Module } from "@nestjs/common";
import { FraymContingentRepository } from "@EventOrganizing/Infrastructure/Domain/Contingent/Fraym/FraymContingentRepository";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";
import { IncreaseContingentCommandHandler } from "@EventOrganizing/Application/Contingent/IncreaseContingent";
import {
    InitializeContingent,
    InitializeContingentCommandHandler,
} from "@EventOrganizing/Application/Contingent/InitializeContingent";
import { LimitContingentCommandHandler } from "@EventOrganizing/Application/Contingent/LimitContingent";
import { ReduceContingentCommandHandler } from "@EventOrganizing/Application/Contingent/ReduceContingent";
import { SetContingentToUnlimitedContingentCommand } from "@EventOrganizing/Application/Contingent/SetContingentToUnlimited";
import { EventOrganizingController } from "@EventOrganizing/Infrastructure/Delivery/Web/EventOrganizingController";
import { GetContingentDataForEvent } from "@EventOrganizing/Application/Contingent/GetContingentDataForEvent";
import { SellContingentCommandHandler } from "@EventOrganizing/Application/Contingent/SellContingent";
import { TestDataBootstrapper } from "@EventOrganizing/Infrastructure/Delivery/Nest/TestDataBootstrapper";

@Module({
    imports: [CqrsModule],
    providers: [
        /* Repositories */
        { provide: ContingentRepository, useClass: FraymContingentRepository },

        /* Command handlers */
        IncreaseContingentCommandHandler,
        InitializeContingentCommandHandler,
        LimitContingentCommandHandler,
        ReduceContingentCommandHandler,
        SetContingentToUnlimitedContingentCommand,
        SellContingentCommandHandler,

        /* Application services */
        InitializeContingent,

        /* Queries */
        GetContingentDataForEvent,

        /* Other */
        TestDataBootstrapper,
    ],
    controllers: [EventOrganizingController],
})
export class EventOrganizingModule {}
